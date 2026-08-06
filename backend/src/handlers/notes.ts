import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { query, queryOne } from "../lib/db.js";
import { callBedrockJSON } from "../lib/bedrock.js";
import { success, badRequest, serverError } from "../lib/response.js";

const EXTRACTION_SYSTEM_PROMPT = "You are analyzing a student's own course notes to understand what they are studying and how well they understand it. Extract 4-8 specific topics. Confidence 1 means barely started, 5 means could teach it. Infer confidence from how the notes are written — hedging, question marks, and '???' mean low confidence; worked examples and clean summaries mean high. Return only valid JSON with this structure: { \"topics\": [{\"topic\": \"string\", \"confidence\": 1-5, \"status\": \"learning|reviewing|stuck\"}], \"overall_pace\": \"behind|on_track|ahead\", \"summary\": \"one sentence\" }";

export async function uploadNotes(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const body = JSON.parse(event.body || "{}");
    const { user_id, course_id, raw_text } = body;
    
    if (!user_id) return badRequest("user_id required");
    if (!course_id) return badRequest("course_id required");
    if (!raw_text || raw_text.trim().length < 100) return badRequest("At least 100 characters of notes required");
    
    // Get course info
    const course = await queryOne<{ code: string; title: string }>(
      `SELECT code, title FROM courses WHERE id = $1`, [course_id]
    );
    if (!course) return badRequest("Course not found");
    
    // Store note
    await query(`
      INSERT INTO note_uploads (user_id, course_id, raw_text) VALUES ($1, $2, $3)
    `, [user_id, course_id, raw_text.trim()]);
    
    // Call Bedrock for topic extraction
    const userMessage = `Course: ${course.code} — ${course.title}\n\nStudent Notes:\n${raw_text.trim()}`;
    
    let extraction: any;
    try {
      extraction = await callBedrockJSON(EXTRACTION_SYSTEM_PROMPT, userMessage);
    } catch (aiErr) {
      console.error("Bedrock extraction error:", aiErr);
      return success({ message: "Notes saved but AI extraction failed. Try again later.", topics: null });
    }
    
    // Upsert topic profile
    await query(`
      INSERT INTO topic_profiles (user_id, course_id, topics, overall_pace, summary, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (user_id, course_id) DO UPDATE SET 
        topics = $3, overall_pace = $4, summary = $5, updated_at = NOW()
    `, [user_id, course_id, JSON.stringify(extraction.topics), extraction.overall_pace, extraction.summary]);
    
    return success(extraction);
  } catch (err) {
    console.error("uploadNotes error:", err);
    return serverError("Failed to process notes");
  }
}
