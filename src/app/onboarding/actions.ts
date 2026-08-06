"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export interface OnboardingState {
  error?: string;
}

export async function completeOnboarding(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const displayName = formData.get("display_name") as string | null;
  const year = formData.get("year") as string | null;
  const program = formData.get("program") as string | null;
  const courseIds = formData.getAll("courses") as string[];

  // Validate inputs
  if (!displayName?.trim()) {
    return { error: "Display name is required." };
  }

  if (!year || isNaN(Number(year)) || Number(year) < 1 || Number(year) > 5) {
    return { error: "Please select a valid year (1-5)." };
  }

  if (!program?.trim()) {
    return { error: "Program is required." };
  }

  if (courseIds.length === 0) {
    return { error: "Please select at least one course." };
  }

  const supabase = await createServerClient();

  // Get the current authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to complete onboarding." };
  }

  // Insert profile
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email!,
      display_name: displayName.trim(),
      year: Number(year),
      program: program.trim(),
      onboarded: true,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    return { error: "Failed to create profile. Please try again." };
  }

  // Insert enrollment records
  const enrollments = courseIds.map((courseId) => ({
    user_id: user.id,
    course_id: courseId,
  }));

  const { error: enrollError } = await supabase
    .from("enrollments")
    .upsert(enrollments, { onConflict: "user_id,course_id" });

  if (enrollError) {
    return { error: "Failed to save course enrollments. Please try again." };
  }

  redirect("/subjects");
}
