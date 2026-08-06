import { requireOnboarded } from "@/lib/auth/helpers";
import { NotesForm } from "./notes-form";

export const dynamic = "force-dynamic";

export interface CourseOption {
  id: string;
  code: string;
  title: string;
}

export default async function NotesPage() {
  const { user, supabase } = await requireOnboarded();

  // Fetch user's enrolled courses
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("user_id", user.id);

  const courseIds = (enrollments ?? []).map((e) => e.course_id);

  let courses: CourseOption[] = [];
  if (courseIds.length > 0) {
    const { data } = await supabase
      .from("courses")
      .select("id, code, title")
      .in("id", courseIds)
      .order("code");

    courses = data ?? [];
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload Notes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste your course notes below and we&apos;ll identify your topic strengths and
            weaknesses using AI.
          </p>
        </div>
        <NotesForm courses={courses} />
      </div>
    </div>
  );
}
