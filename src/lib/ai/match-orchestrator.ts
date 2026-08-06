/**
 * Group matching orchestrator for StudyHall UBC.
 * Queries topic profiles, runs the matching algorithm, calls AI for group names,
 * and writes results to the database.
 */

import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  TopicVector,
  greedyGroupFormation,
  computeComplementarityScore,
} from "./match";

/**
 * Result returned for each formed study group.
 */
export interface GroupMatchResult {
  members: string[]; // user IDs
  name: string;
  rationale: string;
  score: number;
  groupId: string; // the created study_group ID
}

/**
 * Zod schema for the AI group naming response.
 */
export const GroupNamingSchema = z.object({
  name: z.string(),
  rationale: z.string(),
});

export type GroupNaming = z.infer<typeof GroupNamingSchema>;

/**
 * Generates a playful group name and rationale using Google Gemini.
 */
async function generateGroupName(
  model: GenerativeModel,
  courseCode: string,
  memberSummaries: string[]
): Promise<GroupNaming> {
  const userMessage = `Course: ${courseCode}

Group members' topic profiles:
${memberSummaries.map((s, i) => `- Member ${i + 1}: ${s}`).join("\n")}

Generate a JSON object with:
- "name": a playful 2-3 word group name themed on the course
- "rationale": a one-sentence rationale explaining why these members complement each other`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
    systemInstruction: { role: "model", parts: [{ text: "Generate a playful 2-3 word group name themed on the course and a one-sentence rationale explaining why these members complement each other. Return only valid JSON, no markdown." }] },
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 256,
    },
  });

  let jsonText = result.response.text().trim();
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  const parsed = JSON.parse(jsonText);
  return GroupNamingSchema.parse(parsed);
}

/**
 * Builds a summary string for a member based on their topic profile.
 */
function buildMemberSummary(
  topics: Array<{ topic: string; confidence: number; status: string }>
): string {
  const strong = topics
    .filter((t) => t.confidence >= 4)
    .map((t) => t.topic);
  const weak = topics
    .filter((t) => t.confidence <= 2)
    .map((t) => t.topic);

  const parts: string[] = [];
  if (strong.length > 0) parts.push(`strong in ${strong.join(", ")}`);
  if (weak.length > 0) parts.push(`needs help with ${weak.join(", ")}`);
  if (parts.length === 0) parts.push("moderate across all topics");

  return parts.join("; ");
}

/**
 * Main orchestrator: queries topic profiles for a course, runs matching,
 * calls AI for group names, and writes study_groups + group_members to the database.
 *
 * Before inserting new groups, deletes any existing groups for this course
 * to make re-matching clean.
 */
export async function matchGroups(courseId: string): Promise<GroupMatchResult[]> {
  const env = getServerEnv();
  const supabase = createServiceRoleClient();

  // 1. Query all topic_profiles for this course
  const { data: profiles, error: profilesError } = await supabase
    .from("topic_profiles")
    .select("user_id, topics, overall_pace, summary")
    .eq("course_id", courseId);

  if (profilesError) {
    throw new Error(`Failed to query topic_profiles: ${profilesError.message}`);
  }

  if (!profiles || profiles.length < 4) {
    return [];
  }

  // 2. Convert to TopicVector[] format
  const vectors: TopicVector[] = profiles.map((profile) => {
    const topicsArray = profile.topics as Array<{
      topic: string;
      confidence: number;
      status: string;
    }>;
    const topicsRecord: Record<string, number> = {};
    for (const t of topicsArray) {
      topicsRecord[t.topic] = t.confidence;
    }
    return {
      userId: profile.user_id as string,
      topics: topicsRecord,
      pace: profile.overall_pace as TopicVector["pace"],
    };
  });

  // 3. Run greedy group formation
  const formedGroups = greedyGroupFormation(vectors);

  if (formedGroups.length === 0) {
    return [];
  }

  // 4. Fetch course code for AI naming context
  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .select("code")
    .eq("id", courseId)
    .single();

  if (courseError || !courseData) {
    throw new Error(`Failed to query course: ${courseError?.message ?? "not found"}`);
  }

  const courseCode = courseData.code;

  // 5. Generate AI names for each group
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const groupResults: Array<{
    members: TopicVector[];
    name: string;
    rationale: string;
    score: number;
  }> = [];

  for (const group of formedGroups) {
    // Build member summaries from the original profile data
    const memberSummaries = group.map((member) => {
      const profileData = profiles.find((p) => p.user_id === member.userId);
      if (profileData) {
        const topicsArray = profileData.topics as Array<{
          topic: string;
          confidence: number;
          status: string;
        }>;
        return buildMemberSummary(topicsArray);
      }
      return "moderate across all topics";
    });

    let naming: GroupNaming;
    try {
      naming = await generateGroupName(model, courseCode, memberSummaries);
    } catch {
      // Fallback naming if AI fails
      naming = {
        name: `Group ${groupResults.length + 1}`,
        rationale: "A complementary study group formed by the matching algorithm.",
      };
    }

    // Compute final complementarity score for this group
    const score = computeComplementarityScore(group);

    groupResults.push({
      members: group,
      name: naming.name,
      rationale: naming.rationale,
      score,
    });
  }

  // 6. Delete existing groups for this course (clean re-matching)
  const { data: existingGroups } = await supabase
    .from("study_groups")
    .select("id")
    .eq("course_id", courseId);

  if (existingGroups && existingGroups.length > 0) {
    const groupIds = existingGroups.map((g) => g.id);
    // Cascade delete will handle group_members
    await supabase.from("study_groups").delete().in("id", groupIds);
  }

  // 7. Insert new study_groups and group_members
  const finalResults: GroupMatchResult[] = [];

  for (const groupResult of groupResults) {
    // Insert study_group
    const { data: insertedGroup, error: insertError } = await supabase
      .from("study_groups")
      .insert({
        course_id: courseId,
        name: groupResult.name,
        rationale: groupResult.rationale,
      })
      .select("id")
      .single();

    if (insertError || !insertedGroup) {
      throw new Error(`Failed to insert study_group: ${insertError?.message ?? "unknown"}`);
    }

    const groupId = insertedGroup.id as string;

    // Insert group_members
    const memberRecords = groupResult.members.map((member) => ({
      group_id: groupId,
      user_id: member.userId,
    }));

    const { error: membersError } = await supabase
      .from("group_members")
      .insert(memberRecords);

    if (membersError) {
      throw new Error(`Failed to insert group_members: ${membersError.message}`);
    }

    finalResults.push({
      members: groupResult.members.map((m) => m.userId),
      name: groupResult.name,
      rationale: groupResult.rationale,
      score: groupResult.score,
      groupId,
    });
  }

  return finalResults;
}
