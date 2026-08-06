import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";

/**
 * Zod schema for a single study session plan.
 */
export const SessionPlanSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  topic: z.string(),
  goal: z.string(),
});

/**
 * Zod schema for the full timeline result — exactly 6 sessions.
 */
export const TimelineResultSchema = z.object({
  sessions: z.array(SessionPlanSchema).length(6),
});

export type SessionPlan = z.infer<typeof SessionPlanSchema>;
export type TimelineResult = z.infer<typeof TimelineResultSchema>;

/**
 * Input representing a group member's topic profile for timeline generation.
 */
export interface TopicProfileInput {
  userId: string;
  topics: Array<{ topic: string; confidence: number; status: string }>;
  overallPace: string;
}

const SYSTEM_PROMPT =
  "You are generating a study session timeline for a study group. Create exactly 6 sessions spread between today and the exam date. Rules: weekdays only (Monday-Friday), each session is exactly 90 minutes, start times between 09:00 and 20:00 (end time can be 21:30 at latest). Order topics from the group's weakest shared topics first, building to stronger topics later. Each session needs a specific topic and an action-oriented one-line goal. Return only JSON.";

/**
 * Aggregates topic profiles across group members.
 * Returns topics sorted from weakest (lowest avg confidence) to strongest.
 */
function aggregateTopicProfiles(
  profiles: TopicProfileInput[]
): Array<{ topic: string; avgConfidence: number; memberCount: number }> {
  const topicMap = new Map<string, { totalConfidence: number; count: number }>();

  for (const profile of profiles) {
    for (const t of profile.topics) {
      const existing = topicMap.get(t.topic);
      if (existing) {
        existing.totalConfidence += t.confidence;
        existing.count += 1;
      } else {
        topicMap.set(t.topic, { totalConfidence: t.confidence, count: 1 });
      }
    }
  }

  const aggregated = Array.from(topicMap.entries()).map(([topic, data]) => ({
    topic,
    avgConfidence: data.totalConfidence / data.count,
    memberCount: data.count,
  }));

  // Sort weakest first
  aggregated.sort((a, b) => a.avgConfidence - b.avgConfidence);
  return aggregated;
}

/**
 * Validates that a date string represents a weekday (Mon-Fri).
 */
function isWeekday(dateStr: string): boolean {
  const date = new Date(dateStr + "T12:00:00");
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

/**
 * Validates that a time string is within bounds (start >= 09:00, end <= 21:30).
 */
function isTimeInBounds(startTime: string, endTime: string): boolean {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Start must be >= 09:00 (540) and <= 20:00 (1200)
  if (startMinutes < 540 || startMinutes > 1200) return false;
  // End must be <= 21:30 (1290)
  if (endMinutes > 1290) return false;

  return true;
}

/**
 * Validates that duration is exactly 90 minutes.
 */
function isDuration90Minutes(startTime: string, endTime: string): boolean {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return endMinutes - startMinutes === 90;
}

/**
 * Post-validation: ensures all business rules are met.
 * Throws an error if any constraint is violated.
 */
function postValidateTimeline(result: TimelineResult): void {
  if (result.sessions.length !== 6) {
    throw new Error(`Expected exactly 6 sessions, got ${result.sessions.length}`);
  }

  for (const session of result.sessions) {
    if (!isWeekday(session.date)) {
      throw new Error(`Session date ${session.date} is not a weekday`);
    }

    if (!isTimeInBounds(session.start_time, session.end_time)) {
      throw new Error(
        `Session time ${session.start_time}-${session.end_time} is out of bounds (09:00-20:00 start, 21:30 latest end)`
      );
    }

    if (!isDuration90Minutes(session.start_time, session.end_time)) {
      throw new Error(
        `Session ${session.date} duration is not 90 minutes: ${session.start_time}-${session.end_time}`
      );
    }
  }
}

/**
 * Formats a Date as YYYY-MM-DD.
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Generates a study session timeline using the Anthropic API.
 * Produces exactly 6 sessions on weekdays, 90 minutes each, ordered from weakest to strongest topics.
 *
 * Retries once on validation failure.
 */
export async function generateTimeline(
  groupProfiles: TopicProfileInput[],
  courseCode: string,
  today: Date,
  examDate: Date
): Promise<TimelineResult> {
  const env = getServerEnv();
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const aggregatedTopics = aggregateTopicProfiles(groupProfiles);

  const topicSummary = aggregatedTopics
    .map(
      (t) =>
        `- ${t.topic}: avg confidence ${t.avgConfidence.toFixed(1)}/5 (${t.memberCount} members)`
    )
    .join("\n");

  const userMessage = `Course: ${courseCode}
Today's date: ${formatDate(today)}
Exam date: ${formatDate(examDate)}

Group Topic Profiles (sorted weakest to strongest):
${topicSummary}

Generate exactly 6 study sessions as JSON in this format:
{
  "sessions": [
    {
      "date": "YYYY-MM-DD",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "topic": "Topic Name",
      "goal": "Action-oriented one-line goal"
    }
  ]
}`;

  const callAI = async (): Promise<TimelineResult> => {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in Anthropic response");
    }

    // Extract JSON from response (handle possible markdown code blocks)
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(jsonText);
    const validated = TimelineResultSchema.parse(parsed);

    // Additional business logic validation
    postValidateTimeline(validated);

    return validated;
  };

  // First attempt
  try {
    return await callAI();
  } catch (firstError) {
    // Retry once on validation failures (Zod, post-validation, or JSON parse errors)
    if (
      firstError instanceof z.ZodError ||
      firstError instanceof SyntaxError ||
      (firstError instanceof Error && firstError.message.includes("Session"))
    ) {
      try {
        return await callAI();
      } catch (secondError) {
        if (secondError instanceof z.ZodError) {
          throw new Error(
            `AI timeline generation failed schema validation after retry: ${secondError.message}`
          );
        }
        if (secondError instanceof SyntaxError) {
          throw new Error(
            `AI timeline generation returned invalid JSON after retry: ${secondError.message}`
          );
        }
        throw secondError;
      }
    }

    throw firstError;
  }
}
