import Link from "next/link";
import { getOptionalUser } from "@/lib/auth/helpers";

export const dynamic = "force-dynamic";

interface SubjectCard {
  id: string;
  code: string;
  name: string;
  colour: string;
  sessionCount: number;
  attendeeCount: number;
  status: string;
  enrolled: boolean;
}

function getStatusPill(
  sessions: Array<{ start_time: string; end_time: string; date: string }>
): string {
  if (sessions.length === 0) return "No sessions today";

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // Check for currently happening sessions
  for (const session of sessions) {
    const start = new Date(`${todayStr}T${session.start_time}`);
    const end = new Date(`${todayStr}T${session.end_time}`);
    if (now >= start && now <= end) {
      return "Happening now";
    }
  }

  // Check for upcoming sessions within 60 minutes
  for (const session of sessions) {
    const start = new Date(`${todayStr}T${session.start_time}`);
    const diffMs = start.getTime() - now.getTime();
    const diffMin = Math.round(diffMs / 60000);
    if (diffMin > 0 && diffMin <= 60) {
      return `Starting in ${diffMin}m`;
    }
  }

  // Check for sessions later today
  for (const session of sessions) {
    const start = new Date(`${todayStr}T${session.start_time}`);
    if (start > now) {
      const hours = start.getHours();
      const ampm = hours >= 12 ? "pm" : "am";
      const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      return `Today ${displayHour}${ampm}`;
    }
  }

  // All sessions already passed today
  return "No more today";
}

export default async function SubjectsPage() {
  const { user, supabase } = await getOptionalUser();

  // Fetch all subjects
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, code, name, colour")
    .order("code");

  if (!subjects || subjects.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
        <p className="mt-4 text-muted-foreground">
          No subjects available yet. Check back soon.
        </p>
      </div>
    );
  }

  // Get today's date in ISO format
  const today = new Date().toISOString().split("T")[0];

  // Fetch today's sessions with attendance counts
  const { data: todaySessions } = await supabase
    .from("sessions")
    .select("id, subject_id, start_time, end_time, date")
    .eq("date", today)
    .eq("status", "scheduled");

  // Fetch attendance for today's sessions
  const sessionIds = (todaySessions ?? []).map((s) => s.id);
  let attendanceCounts: Record<string, number> = {};

  if (sessionIds.length > 0) {
    const { data: attendance } = await supabase
      .from("attendance")
      .select("session_id")
      .in("session_id", sessionIds);

    if (attendance) {
      for (const a of attendance) {
        attendanceCounts[a.session_id] =
          (attendanceCounts[a.session_id] ?? 0) + 1;
      }
    }
  }

  // Get user's enrolled subject IDs if authenticated
  let enrolledSubjectIds: Set<string> = new Set();
  if (user) {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course_id, courses!inner(subject_id)")
      .eq("user_id", user.id);

    if (enrollments) {
      for (const e of enrollments) {
        const course = e.courses as unknown as { subject_id: string };
        if (course?.subject_id) {
          enrolledSubjectIds.add(course.subject_id);
        }
      }
    }
  }

  // Build subject cards
  const subjectCards: SubjectCard[] = subjects.map((subject) => {
    const subjectSessions = (todaySessions ?? []).filter(
      (s) => s.subject_id === subject.id
    );
    const sessionCount = subjectSessions.length;
    const attendeeCount = subjectSessions.reduce(
      (sum, s) => sum + (attendanceCounts[s.id] ?? 0),
      0
    );
    const status = getStatusPill(subjectSessions);
    const enrolled = enrolledSubjectIds.has(subject.id);

    return {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      colour: subject.colour,
      sessionCount,
      attendeeCount,
      status,
      enrolled,
    };
  });

  // Sort: enrolled subjects first, then alphabetically by code
  subjectCards.sort((a, b) => {
    if (a.enrolled && !b.enrolled) return -1;
    if (!a.enrolled && b.enrolled) return 1;
    return a.code.localeCompare(b.code);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Subjects</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:mt-2">
          Browse study sessions across UBC departments
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {subjectCards.map((subject) => (
          <Link
            key={subject.id}
            href={`/subjects/${subject.code}`}
            className="group relative flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ borderLeftColor: subject.colour, borderLeftWidth: "4px" }}
          >
            {subject.enrolled && (
              <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Enrolled
              </span>
            )}

            <span
              className="text-2xl font-bold tracking-tight"
              style={{ color: subject.colour }}
            >
              {subject.code}
            </span>
            <span className="mt-1 text-sm text-muted-foreground line-clamp-1">
              {subject.name}
            </span>

            <div className="mt-4 flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">
                {subject.sessionCount === 0
                  ? "No sessions today"
                  : `${subject.sessionCount} session${subject.sessionCount !== 1 ? "s" : ""} today`}
              </span>
              {subject.attendeeCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {subject.attendeeCount} attendee
                  {subject.attendeeCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="mt-3">
              <StatusPill status={subject.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  let bgClass = "bg-muted text-muted-foreground";

  if (status === "Happening now") {
    bgClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  } else if (status.startsWith("Starting in")) {
    bgClass = "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  } else if (status.startsWith("Today")) {
    bgClass = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgClass}`}
    >
      {status === "Happening now" && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
      )}
      {status}
    </span>
  );
}
