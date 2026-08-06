import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { query, queryOne } from "../lib/db.js";
import { success, notFound, serverError } from "../lib/response.js";

export async function getSubjects(): Promise<APIGatewayProxyResult> {
  try {
    const today = new Date().toISOString().split("T")[0];
    
    const subjects = await query(`
      SELECT s.id, s.code, s.name, s.colour,
        (SELECT COUNT(*) FROM sessions sess WHERE sess.subject_id = s.id AND sess.date = $1 AND sess.status = 'scheduled') as session_count,
        (SELECT COUNT(*) FROM attendance a JOIN sessions sess ON a.session_id = sess.id WHERE sess.subject_id = s.id AND sess.date = $1) as attendee_count
      FROM subjects s ORDER BY s.code
    `, [today]);
    
    return success(subjects);
  } catch (err) {
    console.error("getSubjects error:", err);
    return serverError("Failed to fetch subjects");
  }
}

export async function getSubjectDetail(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const code = event.pathParameters?.code?.toUpperCase();
    if (!code) return notFound("Subject code required");
    
    const subject = await queryOne(`SELECT id, code, name, colour FROM subjects WHERE code = $1`, [code]);
    if (!subject) return notFound("Subject not found");
    
    // Get next 7 days of sessions
    const today = new Date().toISOString().split("T")[0];
    const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
    
    const sessions = await query(`
      SELECT s.id, s.date, s.start_time, s.end_time, s.topic, s.goal, s.status,
        r.name as room_name, r.building as room_building,
        c.code as course_code,
        (SELECT COUNT(*) FROM attendance a WHERE a.session_id = s.id) as attendee_count
      FROM sessions s
      JOIN rooms r ON s.room_id = r.id
      JOIN study_groups sg ON s.group_id = sg.id
      JOIN courses c ON sg.course_id = c.id
      WHERE s.subject_id = $1 AND s.date >= $2 AND s.date <= $3
      ORDER BY s.date, s.start_time
    `, [subject.id, today, weekFromNow]);
    
    return success({ subject, sessions });
  } catch (err) {
    console.error("getSubjectDetail error:", err);
    return serverError("Failed to fetch subject detail");
  }
}
