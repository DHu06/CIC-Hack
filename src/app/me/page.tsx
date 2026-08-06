import Link from "next/link";
import { requireOnboarded } from "@/lib/auth/helpers";

export const dynamic = "force-dynamic";

interface SessionRow {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  topic: string;
  status: string;
  rooms: { name: string; building: string } | null;
  study_groups: {
    name: string;
    courses: { code: string } | null;
  } | null;
  attendance: { status: string }[];
}

export default async function MySessionsPage() {
  const { user, supabase } = await requireOnboarded();

  // Get groups the user is a member of
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);

  const groupIds = (memberships ?? []).map((m) => m.group_id);

  // Get today's date for filtering
  const today = new Date().toISOString().split("T")[0];

  // Get sessions from user's groups (upcoming only)
  let groupSessions: SessionRow[] = [];
  if (groupIds.length > 0) {
    const { data } = await supabase
      .from("sessions")
      .select(
        `
        id,
        date,
        start_time,
        end_time,
        topic,
        status,
        rooms ( name, building ),
        study_groups ( name, courses ( code ) ),
        attendance ( status )
      `
      )
      .in("group_id", groupIds)
      .gte("date", today)
      .eq("status", "scheduled")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    groupSessions = (data ?? []) as unknown as SessionRow[];
  }

  // Get sessions the user has RSVP'd to (that aren't already from their groups)
  const { data: rsvpRecords } = await supabase
    .from("attendance")
    .select("session_id")
    .eq("user_id", user.id);

  const rsvpSessionIds = (rsvpRecords ?? []).map((r) => r.session_id);
  const groupSessionIds = new Set(groupSessions.map((s) => s.id));
  const extraRsvpIds = rsvpSessionIds.filter((id) => !groupSessionIds.has(id));

  let rsvpSessions: SessionRow[] = [];
  if (extraRsvpIds.length > 0) {
    const { data } = await supabase
      .from("sessions")
      .select(
        `
        id,
        date,
        start_time,
        end_time,
        topic,
        status,
        rooms ( name, building ),
        study_groups ( name, courses ( code ) ),
        attendance ( status )
      `
      )
      .in("id", extraRsvpIds)
      .gte("date", today)
      .eq("status", "scheduled")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    rsvpSessions = (data ?? []) as unknown as SessionRow[];
  }

  // Merge and deduplicate
  const allSessions = [...groupSessions, ...rsvpSessions];

  // Group by date bucket
  const todayStr = today;
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split("T")[0];

  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
  const endOfWeekStr = endOfWeek.toISOString().split("T")[0];

  const grouped: Record<string, SessionRow[]> = {
    Today: [],
    Tomorrow: [],
    "This Week": [],
    Later: [],
  };

  for (const session of allSessions) {
    if (session.date === todayStr) {
      grouped["Today"].push(session);
    } else if (session.date === tomorrowStr) {
      grouped["Tomorrow"].push(session);
    } else if (session.date <= endOfWeekStr) {
      grouped["This Week"].push(session);
    } else {
      grouped["Later"].push(session);
    }
  }

  const hasAnySessions = allSessions.length > 0;

  // Check which sessions the user has RSVP'd to
  const rsvpSet = new Set(rsvpSessionIds);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight">My Sessions</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your upcoming study sessions from your groups and RSVPs.
      </p>

      {!hasAnySessions ? (
        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-muted p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold">No upcoming sessions</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload notes and get matched into a study group to see sessions
            here.
          </p>
          <Link
            href="/notes"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Upload Notes
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {(["Today", "Tomorrow", "This Week", "Later"] as const).map(
            (bucket) => {
              const items = grouped[bucket];
              if (items.length === 0) return null;

              return (
                <div key={bucket}>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {bucket}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {items.map((session) => {
                      const room = session.rooms;
                      const group = session.study_groups;
                      const isRsvpd = rsvpSet.has(session.id);

                      return (
                        <Link
                          key={session.id}
                          href={`/sessions/${session.id}`}
                          className="flex flex-col gap-1.5 rounded-lg border border-border p-4 transition-shadow hover:shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-primary">
                              {group?.courses?.code ?? "—"}
                            </span>
                            {isRsvpd && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                RSVP&apos;d
                              </span>
                            )}
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
                          {group && (
                            <span className="text-xs text-muted-foreground">
                              {group.name}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>
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
