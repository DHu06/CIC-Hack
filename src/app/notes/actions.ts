"use server";

import { requireOnboarded } from "@/lib/auth/helpers";
import { extractTopics, type TopicExtraction } from "@/lib/ai/extract";

export interface UploadResult {
  success?: boolean;
  error?: string;
  topics?: TopicExtraction;
}

export async function uploadNotes(
  _prevState: UploadResult,
  formData: FormData
): Promise<UploadResult> {
  const rawText = formData.get("rawText") as string | null;
  const courseId = formData.get("courseId") as string | null;

  // Validate inputs
  if (!rawText?.trim() || rawText.trim().length < 100) {
    return { error: "Please paste at least 100 characters of notes." };
  }

  if (!courseId) {
    return { error: "Please select a course." };
  }

  let user;
  let supabase;

  try {
    const auth = await requireOnboarded();
    user = auth.user;
    supabase = auth.supabase;
  } catch {
    return { error: "You must be signed in and onboarded to upload notes." };
  }

  // Fetch course info for the AI pipeline
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, code, title")
    .eq("id", courseId)
    .single();

  if (courseError || !course) {
    return { error: "Selected course not found." };
  }

  // Verify enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (!enrollment) {
    return { error: "You are not enrolled in this course." };
  }

  // Store the note upload
  const { error: insertError } = await supabase.from("note_uploads").insert({
    user_id: user.id,
    course_id: courseId,
    raw_text: rawText.trim(),
    filename: null,
  });

  if (insertError) {
    return { error: "Failed to save your notes. Please try again." };
  }

  // Call AI topic extraction
  let extraction: TopicExtraction;
  try {
    extraction = await extractTopics(rawText.trim(), course.code, course.title);
  } catch {
    return {
      error:
        "Unable to process your notes right now. Your notes have been saved — try again later.",
    };
  }

  // Upsert topic_profiles
  const { error: upsertError } = await supabase.from("topic_profiles").upsert(
    {
      user_id: user.id,
      course_id: courseId,
      topics: extraction.topics,
      overall_pace: extraction.overall_pace,
      summary: extraction.summary,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,course_id" }
  );

  if (upsertError) {
    return {
      error: "Notes processed but failed to save your topic profile. Please try again.",
    };
  }

  return { success: true, topics: extraction };
}
