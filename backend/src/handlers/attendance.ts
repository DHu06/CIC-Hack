import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { query, queryOne } from "../lib/db.js";
import { success, badRequest, notFound, serverError } from "../lib/response.js";

export async function rsvpSession(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const sessionId = event.pathParameters?.id;
    if (!sessionId) return badRequest("Session ID required");
    
    const body = JSON.parse(event.body || "{}");
    const userId = body.user_id;
    if (!userId) return badRequest("user_id required");
    
    // Upsert attendance
    await query(`
      INSERT INTO attendance (session_id, user_id, status, rsvp_at)
      VALUES ($1, $2, 'rsvp', NOW())
      ON CONFLICT (session_id, user_id) DO UPDATE SET status = 'rsvp', rsvp_at = NOW()
    `, [sessionId, userId]);
    
    return success({ message: "RSVP confirmed" });
  } catch (err) {
    console.error("rsvpSession error:", err);
    return serverError("Failed to RSVP");
  }
}

export async function checkIn(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const sessionId = event.pathParameters?.id;
    if (!sessionId) return badRequest("Session ID required");
    
    const body = JSON.parse(event.body || "{}");
    const { user_id, code } = body;
    if (!user_id) return badRequest("user_id required");
    if (!code) return badRequest("Check-in code required");
    
    // Verify code
    const session = await queryOne<{ checkin_code: string }>(
      `SELECT checkin_code FROM sessions WHERE id = $1`, [sessionId]
    );
    if (!session) return notFound("Session not found");
    if (code !== session.checkin_code) return badRequest("Invalid check-in code");
    
    // Upsert attendance as checked_in
    await query(`
      INSERT INTO attendance (session_id, user_id, status, checked_in_at)
      VALUES ($1, $2, 'checked_in', NOW())
      ON CONFLICT (session_id, user_id) DO UPDATE SET status = 'checked_in', checked_in_at = NOW()
    `, [sessionId, user_id]);
    
    return success({ message: "Checked in successfully" });
  } catch (err) {
    console.error("checkIn error:", err);
    return serverError("Failed to check in");
  }
}

export async function getAttendance(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const sessionId = event.pathParameters?.id;
    if (!sessionId) return badRequest("Session ID required");
    
    const attendees = await query(`
      SELECT a.id, a.user_id, a.status, a.rsvp_at, a.checked_in_at,
        p.display_name, p.avatar_url
      FROM attendance a
      JOIN profiles p ON a.user_id = p.id
      WHERE a.session_id = $1
    `, [sessionId]);
    
    const rsvpCount = attendees.filter((a: any) => a.status === "rsvp").length;
    const checkedInCount = attendees.filter((a: any) => a.status === "checked_in").length;
    
    return success({ attendees, rsvpCount, checkedInCount });
  } catch (err) {
    console.error("getAttendance error:", err);
    return serverError("Failed to fetch attendance");
  }
}
