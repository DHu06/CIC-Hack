/**
 * Session creation utilities for StudyHall UBC.
 * Handles room assignment (round-robin), check-in code generation,
 * and writing sessions to the database.
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import { generateTimeline, type SessionPlan, type TopicProfileInput } from "./timeline";

/**
 * Generate a random 4-digit numeric check-in code (1000–9999).
 */
export function generateCheckinCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Generate a set of unique 4-digit check-in codes.
 * Guarantees all codes in the batch are distinct.
 *
 * @param count - Number of unique codes to generate
 * @returns Array of unique 4-digit numeric strings
 */
export function generateUniqueCheckinCodes(count: number): string[] {
  const codes = new Set<string>();
  while (codes.size < count) {
    codes.add(generateCheckinCode());
  }
  return Array.from(codes);
}

/**
 * Assign rooms to sessions using round-robin from available rooms.
 * Each session gets a room; rooms are cycled in order.
 *
 * @param sessions - Array of session plans to assign rooms to
 * @param rooms - Available rooms with id and name
 * @returns Array of session plans paired with their assigned room ID
 */
export function assignRoomsRoundRobin(
  sessions: SessionPlan[],
  rooms: Array<{ id: string; name: string }>
): Array<{ sessionPlan: SessionPlan; roomId: string }> {
  if (rooms.length === 0) {
    throw new Error("No rooms available for assignment");
  }

  return sessions.map((session, index) => ({
    sessionPlan: session,
    roomId: rooms[index % rooms.length].id,
  }));
}

/**
 * Full orchestrator: generates timeline, assigns rooms, generates codes, writes to DB.
 *
 * 1. Calls generateTimeline() to get 6 session plans from AI
 * 2. Fetches available rooms from the database
 * 3. Assigns rooms using round-robin
 * 4. Generates unique 4-digit check-in codes for each session
 * 5. Inserts sessions into the database using service role client (bypasses RLS)
 *
 * @param groupId - The study group ID these sessions belong to
 * @param courseId - Course ID (unused directly but needed for subject lookup)
 * @param subjectId - Subject ID for the sessions table
 * @param groupProfiles - Topic profiles for the group members
 * @param courseCode - Course code string (e.g. "CPSC 221")
 * @param examDate - The exam date for timeline scheduling
 */
export async function createSessionsForGroup(
  groupId: string,
  courseId: string,
  subjectId: string,
  groupProfiles: TopicProfileInput[],
  courseCode: string,
  examDate: Date
): Promise<void> {
  // 1. Generate timeline using AI
  const timeline = await generateTimeline(
    groupProfiles,
    courseCode,
    new Date(),
    examDate
  );

  // 2. Fetch rooms from DB
  const supabase = createServiceRoleClient();
  const { data: rooms, error: roomsError } = await supabase
    .from("rooms")
    .select("id, name")
    .order("name");

  if (roomsError || !rooms || rooms.length === 0) {
    throw new Error("Failed to fetch rooms or no rooms available");
  }

  // 3. Assign rooms round-robin
  const sessionsWithRooms = assignRoomsRoundRobin(timeline.sessions, rooms);

  // 4. Generate unique check-in codes for this batch
  const codes = generateUniqueCheckinCodes(sessionsWithRooms.length);

  // 5. Insert sessions into DB
  const sessionRows = sessionsWithRooms.map((item, index) => ({
    group_id: groupId,
    room_id: item.roomId,
    subject_id: subjectId,
    date: item.sessionPlan.date,
    start_time: item.sessionPlan.start_time,
    end_time: item.sessionPlan.end_time,
    topic: item.sessionPlan.topic,
    goal: item.sessionPlan.goal,
    status: "scheduled",
    checkin_code: codes[index],
  }));

  const { error: insertError } = await supabase
    .from("sessions")
    .insert(sessionRows);

  if (insertError) {
    throw new Error(`Failed to insert sessions: ${insertError.message}`);
  }
}
