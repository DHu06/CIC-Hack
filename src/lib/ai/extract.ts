import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";

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
  "You are analyzing a student's own course notes to understand what they are studying and how well they understand it. Extract 4-8 specific topics. Confidence 1 means barely started, 5 means could teach it. Infer confidence from how the notes are written — hedging, question marks, and '???' mean low confidence; worked examples and clean summaries mean high. Return only JSON.";

/**
 * Extracts topics from student notes using the Anthropic API.
 * Validates the response with Zod and retries once on validation failure.
 */
export async function extractTopics(
  rawText: string,
  courseCode: string,
  courseTitle: string
): Promise<TopicExtraction> {
  const env = getServerEnv();
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const userMessage = `Course: ${courseCode} — ${courseTitle}\n\nStudent Notes:\n${rawText}`;

  const callAI = async () => {
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

    const parsed = JSON.parse(textBlock.text);
    return TopicExtractionSchema.parse(parsed);
  };

  // First attempt
  try {
    return await callAI();
  } catch (firstError) {
    // If it's a Zod validation error, retry once
    if (firstError instanceof z.ZodError) {
      try {
        return await callAI();
      } catch (secondError) {
        if (secondError instanceof z.ZodError) {
          throw new Error(
            `AI topic extraction failed schema validation after retry: ${secondError.message}`
          );
        }
        throw secondError;
      }
    }

    // If it's a JSON parse error, also retry once
    if (firstError instanceof SyntaxError) {
      try {
        return await callAI();
      } catch (secondError) {
        if (secondError instanceof SyntaxError || secondError instanceof z.ZodError) {
          throw new Error(
            `AI topic extraction returned invalid JSON after retry: ${
              secondError instanceof z.ZodError ? secondError.message : (secondError as Error).message
            }`
          );
        }
        throw secondError;
      }
    }

    throw firstError;
  }
}
