import { z } from "zod";

/**
 * Zod schema for a single extracted topic.
 */
export const TopicSchema = z.object({
  topic: z.string(),
  confidence: z.number().int().min(1).max(5),
  status: z.enum(["learning", "reviewing", "stuck"]),
});

/**
 * Zod schema for the full topic extraction response from the AI.
 */
export const TopicExtractionSchema = z.object({
  topics: z.array(TopicSchema).min(1),
  overall_pace: z.enum(["behind", "on_track", "ahead"]),
  summary: z.string(),
});

export type TopicExtraction = z.infer<typeof TopicExtractionSchema>;
export type Topic = z.infer<typeof TopicSchema>;

const SYSTEM_PROMPT =
  "You are analyzing a student's own course notes to understand what they are studying and how well they understand it. Extract 4-8 specific topics. Confidence 1 means barely started, 5 means could teach it. Infer confidence from how the notes are written — hedging, question marks, and '???' mean low confidence; worked examples and clean summaries mean high. Return only valid JSON, no markdown.";

/**
 * DEPRECATED: Topic extraction now happens in the Lambda backend via Bedrock.
 * This function is kept as a stub for type compatibility during migration.
 */
export async function extractTopics(
  _rawText: string,
  _courseCode: string,
  _courseTitle: string
): Promise<TopicExtraction> {
  throw new Error(
    "extractTopics has been moved to the Lambda backend. Use the API client instead."
  );
}
