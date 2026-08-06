"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

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
 * Real-time attendance hook for a study session.
 * Subscribes to Supabase Realtime changes on the attendance table filtered by session_id.
 * Automatically refetches state on reconnection to ensure consistency.
 *
 * @param sessionId - The UUID of the session to track attendance for
 * @returns AttendanceState with live counts and attendee list
 */
export function useAttendance(sessionId: string): AttendanceState {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const supabase = createBrowserClient();

  /**
   * Fetch the full attendance state for a session, joining with profiles
   * for display_name and avatar_url.
   */
  const fetchAttendance = useCallback(async () => {
    const { data, error } = await supabase
      .from("attendance")
      .select(
        `
        id,
        user_id,
        status,
        rsvp_at,
        checked_in_at,
        profiles!attendance_user_id_fkey (
          display_name,
          avatar_url
        )
      `
      )
      .eq("session_id", sessionId);

    if (error) {
      console.error("[useAttendance] Failed to fetch attendance:", error);
      return;
    }

    if (data) {
      const mapped: Attendee[] = data.map((row) => {
        // profiles comes back as an object (single relation) or null
        const profile = row.profiles as unknown as {
          display_name: string;
          avatar_url: string | null;
        } | null;

        return {
          id: row.id,
          userId: row.user_id,
          displayName: profile?.display_name ?? "Unknown",
          avatarUrl: profile?.avatar_url ?? null,
          status: row.status as Attendee["status"],
          rsvpAt: row.rsvp_at,
          checkedInAt: row.checked_in_at,
        };
      });

      setAttendees(mapped);
    }

    setIsLoading(false);
  }, [sessionId, supabase]);

  /**
   * Fetch profile info for a single user (used when realtime only gives us
   * the attendance row without the joined profile data).
   */
  const fetchProfile = useCallback(
    async (
      userId: string
    ): Promise<{ display_name: string; avatar_url: string | null } | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", userId)
        .single();

      if (error || !data) return null;
      return data;
    },
    [supabase]
  );

  useEffect(() => {
    // Initial fetch
    fetchAttendance();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`attendance:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance",
          filter: `session_id=eq.${sessionId}`,
        },
        async (payload) => {
          const eventType = payload.eventType;

          if (eventType === "INSERT") {
            const newRow = payload.new as {
              id: string;
              user_id: string;
              status: string;
              rsvp_at: string | null;
              checked_in_at: string | null;
            };

            // Fetch profile info for the new attendee
            const profile = await fetchProfile(newRow.user_id);

            const newAttendee: Attendee = {
              id: newRow.id,
              userId: newRow.user_id,
              displayName: profile?.display_name ?? "Unknown",
              avatarUrl: profile?.avatar_url ?? null,
              status: newRow.status as Attendee["status"],
              rsvpAt: newRow.rsvp_at,
              checkedInAt: newRow.checked_in_at,
            };

            setAttendees((prev) => {
              // Avoid duplicates (in case of race with initial fetch)
              if (prev.some((a) => a.id === newAttendee.id)) return prev;
              return [...prev, newAttendee];
            });
          } else if (eventType === "UPDATE") {
            const updated = payload.new as {
              id: string;
              user_id: string;
              status: string;
              rsvp_at: string | null;
              checked_in_at: string | null;
            };

            setAttendees((prev) =>
              prev.map((a) =>
                a.id === updated.id
                  ? {
                      ...a,
                      status: updated.status as Attendee["status"],
                      rsvpAt: updated.rsvp_at,
                      checkedInAt: updated.checked_in_at,
                    }
                  : a
              )
            );
          } else if (eventType === "DELETE") {
            const deleted = payload.old as { id: string };

            setAttendees((prev) => prev.filter((a) => a.id !== deleted.id));
          }
        }
      )
      .subscribe((status) => {
        // Handle reconnection: refetch full state to ensure consistency
        if (status === "SUBSCRIBED") {
          // Channel just (re)connected — refetch to sync any missed events
          fetchAttendance();
        }
      });

    channelRef.current = channel;

    // Cleanup: unsubscribe on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [sessionId, supabase, fetchAttendance, fetchProfile]);

  // Derive counts from attendees array
  const rsvpCount = attendees.filter((a) => a.status === "rsvp").length;
  const checkedInCount = attendees.filter(
    (a) => a.status === "checked_in"
  ).length;

  return {
    rsvpCount,
    checkedInCount,
    attendees,
    isLoading,
  };
}
