"use server";

import { revalidatePath } from "next/cache";
import { requireOnboarded } from "@/lib/auth/helpers";

/**
 * RSVP to a study session. Creates an attendance record with status='rsvp'.
 * Uses upsert with onConflict to handle duplicate RSVPs gracefully.
 */
export async function rsvpSession(
  sessionId: string
): Promise<{ error?: string }> {
  try {
    const { user, supabase } = await requireOnboarded();

    const { error } = await supabase.from("attendance").upsert(
      {
        session_id: sessionId,
        user_id: user.id,
        status: "rsvp",
        rsvp_at: new Date().toISOString(),
      },
      { onConflict: "session_id,user_id" }
    );

    if (error) {
      return { error: "Failed to RSVP. Please try again." };
    }

    revalidatePath(`/sessions/${sessionId}`);
    return {};
  } catch {
    // requireOnboarded redirects throw — let those propagate
    // For any other unexpected error, return a friendly message
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Check in to a study session using a 4-digit code.
 * Verifies the code against the session's checkin_code (exact match, case-sensitive).
 * If the user has an existing RSVP, updates it. Otherwise creates a new checked_in record.
 */
export async function checkIn(
  sessionId: string,
  code: string
): Promise<{ error?: string }> {
  try {
    const { user, supabase } = await requireOnboarded();

    // Fetch the session to get the real checkin_code
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("checkin_code")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return { error: "Session not found." };
    }

    // Compare input code with session's checkin_code (exact match)
    if (code !== session.checkin_code) {
      return { error: "Invalid check-in code" };
    }

    // Upsert attendance record to checked_in status
    // This handles both cases: user already RSVP'd or user checking in directly
    const { error } = await supabase.from("attendance").upsert(
      {
        session_id: sessionId,
        user_id: user.id,
        status: "checked_in",
        checked_in_at: new Date().toISOString(),
      },
      { onConflict: "session_id,user_id" }
    );

    if (error) {
      return { error: "Failed to check in. Please try again." };
    }

    revalidatePath(`/sessions/${sessionId}`);
    return {};
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Cancel an RSVP for a study session.
 * Deletes the attendance record for this user + session.
 */
export async function cancelRsvp(
  sessionId: string
): Promise<{ error?: string }> {
  try {
    const { user, supabase } = await requireOnboarded();

    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("session_id", sessionId)
      .eq("user_id", user.id);

    if (error) {
      return { error: "Failed to cancel RSVP. Please try again." };
    }

    revalidatePath(`/sessions/${sessionId}`);
    return {};
  } catch {
    return { error: "Something went wrong. Please try again." };
  }
}
