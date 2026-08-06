import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./onboarding-form";

export const dynamic = "force-dynamic";

interface Course {
  id: string;
  code: string;
  title: string;
  subject_id: string;
}

interface Subject {
  id: string;
  code: string;
  name: string;
  colour: string;
}

export interface CourseWithSubject extends Course {
  subject: Subject;
}

export default async function OnboardingPage() {
  const supabase = await createServerClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Check if already onboarded
  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded")
    .eq("id", user.id)
    .single();

  if (profile?.onboarded) {
    redirect("/subjects");
  }

  // Fetch all courses with their subjects
  const { data: courses } = await supabase
    .from("courses")
    .select("id, code, title, subject_id")
    .order("code");

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, code, name, colour")
    .order("name");

  // Group courses by subject
  const subjectMap = new Map<string, Subject>();
  for (const subject of subjects ?? []) {
    subjectMap.set(subject.id, subject);
  }

  const coursesWithSubject: CourseWithSubject[] = (courses ?? []).map(
    (course) => ({
      ...course,
      subject: subjectMap.get(course.subject_id)!,
    })
  );

  // Group by subject for display
  const coursesBySubject = new Map<string, CourseWithSubject[]>();
  for (const course of coursesWithSubject) {
    const subjectName = course.subject.name;
    if (!coursesBySubject.has(subjectName)) {
      coursesBySubject.set(subjectName, []);
    }
    coursesBySubject.get(subjectName)!.push(course);
  }

  const groupedCourses = Array.from(coursesBySubject.entries()).map(
    ([subjectName, courses]) => ({
      subjectName,
      colour: courses[0].subject.colour,
      courses,
    })
  );

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <OnboardingForm groupedCourses={groupedCourses} />
    </div>
  );
}
