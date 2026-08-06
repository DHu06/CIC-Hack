import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Requires an authenticated user. Redirects to /auth if no session exists.
 * Use in Server Components and Server Actions that need a logged-in user.
 *
 * @returns The authenticated user and a Supabase client scoped to their session
 */
export async function requireAuth() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return { user, supabase };
}

/**
 * Requires an authenticated AND onboarded user. Redirects to /auth if not
 * authenticated, or /onboarding if the user hasn't completed profile setup.
 * Use in Server Components and Server Actions for fully-onboarded features.
 *
 * @returns The user, supabase client, and their profile record
 */
export async function requireOnboarded() {
  const { user, supabase } = await requireAuth();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.onboarded) {
    redirect("/onboarding");
  }

  return { user, supabase, profile };
}

/**
 * Gets the current user without requiring authentication. Returns null user
 * if no session exists. Useful for pages that work for both authenticated
 * and anonymous users (e.g., subjects page).
 *
 * @returns The user (or null) and a Supabase client
 */
export async function getOptionalUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, supabase };
}
