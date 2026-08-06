import Link from "next/link";
import { getOptionalUser } from "@/lib/auth/helpers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { user, supabase } = await getOptionalUser();

  // Fetch today's sessions ordered by start_time
  const today = new Date().toISOString().split("T")[0];
  const { data: sessions } = await supabase
    .from("sessions")
    .select(
      `
      id,
      date,
      start_time,
      end_time,
      topic,
      status,
      room_id,
      rooms ( name, building ),
      study_groups ( name, course_id, courses ( code ) ),
      attendance ( id )
    `
    )
    .eq("date", today)
    .eq("status", "scheduled")
    .order("start_time", { ascending: true })
    .limit(20);

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Upload notes. Get matched.{" "}
            <span className="text-primary">Study smarter together.</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            AI-powered complementary study groups for UBC students. Get matched
            with classmates who are strong where you&apos;re weak, and help them
            where you shine.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {user ? (
              <>
                <Link
                  href="/subjects"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  Browse Subjects
                </Link>
                <Link
                  href="/me"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  My Sessions
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  Sign In with UBC Email
                </Link>
                <Link
                  href="/subjects"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Browse Subjects
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Live Sessions Strip */}
      {sessions && sessions.length > 0 && (
        <section className="border-t border-border bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-4 text-lg font-semibold">
              Happening Today
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
              {sessions.map((session) => {
                // Supabase joins return objects for singular relations
                const room = session.rooms as unknown as
                  { name: string; building: string } | null;
                const group = session.study_groups as unknown as
                  { name: string; course_id: string; courses: { code: string } | null } | null;
                const courseCode = group?.courses?.code ?? "—";
                const attendeeCount = Array.isArray(session.attendance)
                  ? session.attendance.length
                  : 0;

                return (
                  <Link
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className="flex min-w-[220px] flex-shrink-0 flex-col gap-1 rounded-lg border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md sm:min-w-[240px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-primary">
                        {courseCode}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {attendeeCount} attending
                      </span>
                    </div>
                    <span className="text-sm font-semibold leading-tight line-clamp-2">
                      {session.topic}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(session.start_time)} –{" "}
                      {formatTime(session.end_time)}
                    </span>
                    {room && (
                      <span className="text-xs text-muted-foreground">
                        {room.name}, {room.building}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:${minutes} ${ampm}`;
}
