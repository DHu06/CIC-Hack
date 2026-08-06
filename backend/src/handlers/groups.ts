import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { query, queryOne } from "../lib/db.js";
import { callBedrockJSON } from "../lib/bedrock.js";
import { success, badRequest, notFound, serverError } from "../lib/response.js";

// Matching algorithm (same as frontend version)
interface TopicVector {
  userId: string;
  topics: Record<string, number>;
  pace: "behind" | "on_track" | "ahead";
}

function computeComplementarityScore(group: TopicVector[]): number {
  if (group.length < 2) return 0;
  const allTopics = new Set<string>();
  for (const m of group) for (const t of Object.keys(m.topics)) allTopics.add(t);
  
  let sum = 0;
  for (const topic of allTopics) {
    const confs = group.map(m => m.topics[topic] ?? 0).filter(c => c > 0);
    if (confs.length >= 2) sum += Math.max(...confs) - Math.min(...confs);
  }
  
  const paceMap: Record<string, number> = { behind: 0, on_track: 1, ahead: 2 };
  const paces = group.map(m => paceMap[m.pace]);
  const paceSpread = Math.max(...paces) - Math.min(...paces);
  const penalty = paceSpread > 1 ? paceSpread * 2 : 0;
  
  return sum - penalty;
}

function greedyGroupFormation(vectors: TopicVector[], minSize = 4, maxSize = 6): TopicVector[][] {
  if (vectors.length < minSize) return [];
  const remaining = [...vectors];
  const groups: TopicVector[][] = [];
  
  while (remaining.length >= minSize) {
    const seed = remaining.shift()!;
    const group: TopicVector[] = [seed];
    
    while (group.length < maxSize && remaining.length > 0) {
      let bestIdx = -1, bestScore = -Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const score = computeComplementarityScore([...group, remaining[i]]);
        if (score > bestScore) { bestScore = score; bestIdx = i; }
      }
      if (group.length >= minSize && bestScore <= computeComplementarityScore(group)) break;
      group.push(remaining.splice(bestIdx, 1)[0]);
    }
    
    if (group.length >= minSize) groups.push(group);
    else { remaining.push(...group); break; }
  }
  
  // Assign leftovers
  for (const leftover of remaining) {
    let bestIdx = -1, bestScore = -Infinity;
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].length >= maxSize) continue;
      const score = computeComplementarityScore([...groups[i], leftover]);
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    }
    if (bestIdx >= 0) groups[bestIdx].push(leftover);
  }
  
  return groups;
}

export async function getGroup(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const id = event.pathParameters?.id;
    if (!id) return notFound("Group ID required");
    
    const group = await queryOne(`
      SELECT sg.id, sg.name, sg.rationale, sg.course_id,
        c.code as course_code, c.title as course_title,
        sub.code as subject_code, sub.name as subject_name, sub.colour as subject_colour
      FROM study_groups sg
      JOIN courses c ON sg.course_id = c.id
      JOIN subjects sub ON c.subject_id = sub.id
      WHERE sg.id = $1
    `, [id]);
    if (!group) return notFound("Group not found");
    
    const members = await query(`
      SELECT gm.user_id, p.display_name, p.avatar_url,
        tp.topics, tp.overall_pace, tp.summary
      FROM group_members gm
      JOIN profiles p ON gm.user_id = p.id
      LEFT JOIN topic_profiles tp ON tp.user_id = gm.user_id AND tp.course_id = $2
      WHERE gm.group_id = $1
    `, [id, group.course_id]);
    
    const sessions = await query(`
      SELECT s.id, s.date, s.start_time, s.end_time, s.topic, s.goal, s.status,
        r.name as room_name, r.building as room_building,
        (SELECT COUNT(*) FROM attendance a WHERE a.session_id = s.id) as attendee_count
      FROM sessions s
      JOIN rooms r ON s.room_id = r.id
      WHERE s.group_id = $1 AND s.date >= CURRENT_DATE
      ORDER BY s.date, s.start_time
    `, [id]);
    
    return success({ group, members, sessions });
  } catch (err) {
    console.error("getGroup error:", err);
    return serverError("Failed to fetch group");
  }
}

export async function matchGroups(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const courseId = event.pathParameters?.id;
    if (!courseId) return badRequest("Course ID required");
    
    // Get topic profiles for this course
    const profiles = await query(`
      SELECT user_id, topics, overall_pace FROM topic_profiles WHERE course_id = $1
    `, [courseId]);
    
    if (profiles.length < 4) return badRequest("Need at least 4 students with topic profiles");
    
    // Convert to vectors
    const vectors: TopicVector[] = profiles.map((p: any) => {
      const topics: Record<string, number> = {};
      for (const t of p.topics) topics[t.topic] = t.confidence;
      return { userId: p.user_id, topics, pace: p.overall_pace };
    });
    
    // Run matching
    const formed = greedyGroupFormation(vectors);
    if (formed.length === 0) return badRequest("Could not form valid groups");
    
    // Get course code for naming
    const course = await queryOne<{ code: string }>(`SELECT code FROM courses WHERE id = $1`, [courseId]);
    
    // Delete existing groups for this course
    await query(`DELETE FROM study_groups WHERE course_id = $1`, [courseId]);
    
    const results = [];
    for (const group of formed) {
      // Generate name via Bedrock
      let name: string = `Group ${results.length + 1}`;
      let rationale: string = "Complementary study group";
      try {
        const naming = await callBedrockJSON<{ name: string; rationale: string }>(
          "Generate a playful 2-3 word group name themed on the course and a one-sentence rationale. Return only JSON: {\"name\": \"...\", \"rationale\": \"...\"}",
          `Course: ${course?.code || "Unknown"}\nMembers: ${group.length} students with complementary topic strengths`
        );
        name = naming.name;
        rationale = naming.rationale;
      } catch { /* fallback naming */ }
      
      // Insert group
      const inserted: { id: string } | null = await queryOne<{ id: string }>(`
        INSERT INTO study_groups (course_id, name, rationale) VALUES ($1, $2, $3) RETURNING id
      `, [courseId, name, rationale]);
      
      if (inserted) {
        // Insert members
        for (const member of group) {
          await query(`INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)`, [inserted.id, member.userId]);
        }
        results.push({ groupId: inserted.id, name, rationale, members: group.map(m => m.userId), score: computeComplementarityScore(group) });
      }
    }
    
    return success(results);
  } catch (err) {
    console.error("matchGroups error:", err);
    return serverError("Failed to match groups");
  }
}
