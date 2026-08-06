/**
 * Session creation utilities for StudyHall UBC.
 * Handles room assignment (round-robin) and check-in code generation.
 * Database writes are now handled by the Lambda backend.
 */

import { type SessionPlan, type TopicProfileInput } from "./timeline";

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
 * DEPRECATED: Session creation is now handled by the Lambda backend.
 * This stub remains for type compatibility during migration.
 */
export async function createSessionsForGroup(
  _groupId: string,
  _courseId: string,
  _subjectId: string,
  _groupProfiles: TopicProfileInput[],
  _courseCode: string,
  _examDate: Date
): Promise<void> {
  throw new Error(
    "createSessionsForGroup has been moved to the Lambda backend. Use the API client instead."
  );
}
