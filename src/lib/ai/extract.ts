import { GoogleGenerativeAI } from "@google/generative-ai";
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
  "You are analyzing a student's own course notes to understand what they are studying and how well they understand it. Extract 4-8 specific topics. Confidence 1 means barely started, 5 means could teach it. Infer confidence from how the notes are written — hedging, question marks, and '???' mean low confidence; worked examples and clean summaries mean high. Return only valid JSON, no markdown.";

/**
 * Extracts topics from student notes using the Google Gemini API.
 * Validates the response with Zod and retries once on validation failure.
 */
export async function extractTopics(
  rawText: string,
  courseCode: string,
  courseTitle: string
): Promise<TopicExtraction> {
  const env = getServerEnv();
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const userMessage = `Course: ${courseCode} — ${courseTitle}\n\nStudent Notes:\n${rawText}`;

  const callAI = async () => {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      systemInstruction: { role: "model", parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 1024,
      },
    });

    const text = result.response.text();
    let jsonText = text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const parsed = JSON.parse(jsonText);
    return TopicExtractionSchema.parse(parsed);
  };

  // First attempt, retry once on validation failure
  try {
    return await callAI();
  } catch (firstError) {
    if (firstError instanceof z.ZodError || firstError instanceof SyntaxError) {
      try {
        return await callAI();
      } catch (secondError) {
        throw new Error(
          `AI topic extraction failed after retry: ${(secondError as Error).message}`
        );
      }
    }
    throw firstError;
  }
}
