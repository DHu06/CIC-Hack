import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { query, queryOne } from "../lib/db.js";
import { success, notFound, serverError } from "../lib/response.js";

export async function getSessions(): Promise<APIGatewayProxyResult> {
  try {
    const today = new Date().toISOString().split("T")[0];
    
    const sessions = await query(`
      SELECT s.id, s.date, s.start_time, s.end_time, s.topic, s.goal, s.status,
        r.name as room_name, r.building as room_building,
        sg.name as group_name, c.code as course_code,
        sub.code as subject_code, sub.colour as subject_colour,
        (SELECT COUNT(*) FROM attendance a WHERE a.session_id = s.id) as attendee_count
      FROM sessions s
      JOIN rooms r ON s.room_id = r.id
      JOIN study_groups sg ON s.group_id = sg.id
      JOIN courses c ON sg.course_id = c.id
      JOIN subjects sub ON s.subject_id = sub.id
      WHERE s.date = $1 AND s.status = 'scheduled'
      ORDER BY s.start_time
    `, [today]);
    
    return success(sessions);
  } catch (err) {
    console.error("getSessions error:", err);
    return serverError("Failed to fetch sessions");
  }
}

export async function getSessionDetail(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const id = event.pathParameters?.id;
    if (!id) return notFound("Session ID required");
    
    const session = await queryOne(`
      SELECT s.id, s.date, s.start_time, s.end_time, s.topic, s.goal, s.status, s.checkin_code,
        r.id as room_id, r.name as room_name, r.building as room_building, r.floor as room_floor, r.capacity as room_capacity, r.map_url as room_map_url,
        sg.id as group_id, sg.name as group_name, sg.rationale as group_rationale,
        c.code as course_code, c.title as course_title,
        sub.id as subject_id, sub.code as subject_code, sub.name as subject_name, sub.colour as subject_colour
      FROM sessions s
      JOIN rooms r ON s.room_id = r.id
      JOIN study_groups sg ON s.group_id = sg.id
      JOIN courses c ON sg.course_id = c.id
      JOIN subjects sub ON s.subject_id = sub.id
      WHERE s.id = $1
    `, [id]);
    
    if (!session) return notFound("Session not found");
    
    // Get attendees
    const attendees = await query(`
      SELECT a.id, a.user_id, a.status, a.rsvp_at, a.checked_in_at,
        p.display_name, p.avatar_url
      FROM attendance a
      JOIN profiles p ON a.user_id = p.id
      WHERE a.session_id = $1
    `, [id]);
    
    return success({ session, attendees });
  } catch (err) {
    console.error("getSessionDetail error:", err);
    return serverError("Failed to fetch session detail");
  }
}
