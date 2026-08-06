/**
 * API client for StudyHall UBC backend (API Gateway + Lambda).
 * Replaces direct Supabase calls.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  return res.json();
}

// Subjects
export async function getSubjects() {
  return fetchAPI<any[]>("/subjects");
}

export async function getSubjectDetail(code: string) {
  return fetchAPI<{ subject: any; sessions: any[] }>(`/subjects/${code}`);
}

// Sessions
export async function getSessions() {
  return fetchAPI<any[]>("/sessions");
}

export async function getSessionDetail(id: string) {
  return fetchAPI<{ session: any; attendees: any[] }>(`/sessions/${id}`);
}

// Attendance
export async function getAttendance(sessionId: string) {
  return fetchAPI<{ attendees: any[]; rsvpCount: number; checkedInCount: number }>(`/sessions/${sessionId}/attendance`);
}

export async function rsvpSession(sessionId: string, userId: string) {
  return fetchAPI<{ message: string }>(`/sessions/${sessionId}/rsvp`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function checkInSession(sessionId: string, userId: string, code: string) {
  return fetchAPI<{ message: string }>(`/sessions/${sessionId}/checkin`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, code }),
  });
}

// Notes
export async function uploadNotes(userId: string, courseId: string, rawText: string) {
  return fetchAPI<any>("/notes", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, course_id: courseId, raw_text: rawText }),
  });
}

// Groups
export async function getGroup(id: string) {
  return fetchAPI<{ group: any; members: any[]; sessions: any[] }>(`/groups/${id}`);
}

export async function matchGroupsForCourse(courseId: string) {
  return fetchAPI<any[]>(`/courses/${courseId}/match`, { method: "POST" });
}

// Seed
export async function seedDatabase() {
  return fetchAPI<{ message: string; seeded: boolean }>("/seed", { method: "POST" });
}
