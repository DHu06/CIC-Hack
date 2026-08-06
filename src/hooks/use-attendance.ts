"use client";

import { useEffect, useState, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface Attendee {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  status: "rsvp" | "checked_in" | "no_show";
  rsvpAt: string | null;
  checkedInAt: string | null;
}

export interface AttendanceState {
  rsvpCount: number;
  checkedInCount: number;
  attendees: Attendee[];
  isLoading: boolean;
}

/**
 * Attendance hook for a study session.
 * Polls the API for attendance data (real-time via Supabase has been removed).
 *
 * @param sessionId - The UUID of the session to track attendance for
 * @returns AttendanceState with counts and attendee list
 */
export function useAttendance(sessionId: string): AttendanceState {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/sessions/${sessionId}/attendance`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.attendees) {
        setAttendees(data.attendees);
      }
    } catch (err) {
      console.error("[useAttendance] Failed to fetch attendance:", err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchAttendance();

    // Poll every 10 seconds (replaces Supabase Realtime)
    const interval = setInterval(fetchAttendance, 10000);
    return () => clearInterval(interval);
  }, [fetchAttendance]);

  const rsvpCount = attendees.filter((a) => a.status === "rsvp").length;
  const checkedInCount = attendees.filter((a) => a.status === "checked_in").length;

  return {
    rsvpCount,
    checkedInCount,
    attendees,
    isLoading,
  };
}
