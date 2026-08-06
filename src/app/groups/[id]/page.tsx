import { notFound } from "next/navigation";
import { requireOnboarded } from "@/lib/auth/helpers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface TopicEntry {
  topic: string;
  confidence: number;
  status: "learning" | "reviewing" | "stuck";
}

interface MemberProfile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  topics: TopicEntry[];
  overall_pace: string;
  summary: string;
}

interface SessionRow {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  topic: string;
  goal: string | null;
  status: string;
  checkin_code: string;
  rooms: { name: string; building: string } | null;
  attendance: { id: string }[];
}

export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireOnboarded();

  // Fetch group with course info
  const { data: group, error: groupError } = await supabase
    .from("study_groups")
    .select("id, name, rationale, course_id, courses(id, code, title, subject_id, subjects(name, colour))")
    .eq("id", id)
    .single();

  if (groupError || !group) {
    notFound();
  }

  // Fetch group members with profiles and topic_profiles
  const { data: members } = await supabase
    .from("group_members")
    .select("user_id, profiles(display_name, avatar_url)")
    .eq("group_id", id);

  const memberIds = (members ?? []).map((m) => m.user_id);

  // Fetch topic profiles for all members in this course
  const { data: topicProfiles } = await supabase
    .from("topic_profiles")
    .select("user_id, topics, overall_pace, summary")
    .eq("course_id", group.course_id)
    .in("user_id", memberIds.length > 0 ? memberIds : ["__none__"]);

  // Build member profiles
  const memberProfiles: MemberProfile[] = (members ?? []).map((m) => {
    const tp = (topicProfiles ?? []).find((t) => t.user_id === m.user_id);
    const profile = m.profiles as unknown as { display_name: string; avatar_url: string | null } | null;
    return {
      user_id: m.user_id,
      display_name: profile?.display_name ?? "Unknown",
      avatar_url: profile?.avatar_url ?? null,
      topics: (tp?.topics as TopicEntry[]) ?? [],
      overall_pace: tp?.overall_pace ?? "on_track",
      summary: tp?.summary ?? "",
    };
  });

  // Fetch sessions for this group
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, date, start_time, end_time, topic, goal, status, checkin_code, rooms(name, building), attendance(id)")
    .eq("group_id", id)
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date", { ascending: true });

  const course = group.courses as unknown as {
    id: string;
    code: string;
    title: string;
    subject_id: string;
    subjects: { name: string; colour: string } | null;
  } | null;

  const subjectColour = course?.subjects?.colour ?? "#6366f1";

  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{group.name}</h1>
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: subjectColour }}
            >
              {course?.code}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{course?.title}</p>
        </div>

        {/* Rationale Card */}
        {group.rationale && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Why this group works
              </CardTitle>
              <CardDescription>AI-generated group rationale</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{group.rationale}</p>
            </CardContent>
          </Card>
        )}

        {/* Members Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Members</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {memberProfiles.map((member) => (
              <MemberCard
                key={member.user_id}
                member={member}
                accentColour={subjectColour}
              />
            ))}
          </div>
        </section>

        {/* Complementarity Visualization */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Topic Coverage
          </h2>
          <Card>
            <CardContent className="pt-4">
              <ComplementarityChart
                members={memberProfiles}
                accentColour={subjectColour}
              />
            </CardContent>
          </Card>
        </section>

        {/* Timeline Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">
            Upcoming Sessions
          </h2>
          {(sessions ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No upcoming sessions scheduled.
            </p>
          ) : (
            <div className="space-y-3">
              {(sessions as unknown as SessionRow[]).map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  accentColour={subjectColour}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Member Card Component                                       */
/* ─────────────────────────────────────────────────────────── */

function MemberCard({
  member,
  accentColour,
}: {
  member: MemberProfile;
  accentColour: string;
}) {
  const strengths = member.topics.filter((t) => t.confidence >= 4);
  const weaknesses = member.topics.filter((t) => t.confidence <= 2);

  const initials = member.display_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const paceLabel: Record<string, string> = {
    behind: "Behind",
    on_track: "On Track",
    ahead: "Ahead",
  };

  const paceColor: Record<string, string> = {
    behind: "text-orange-600 bg-orange-50",
    on_track: "text-green-600 bg-green-50",
    ahead: "text-blue-600 bg-blue-50",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={member.display_name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: accentColour }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <CardTitle className="truncate text-sm">
              {member.display_name}
            </CardTitle>
            <span
              className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${paceColor[member.overall_pace] ?? "text-gray-600 bg-gray-50"}`}
            >
              {paceLabel[member.overall_pace] ?? member.overall_pace}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Strengths
            </p>
            <div className="flex flex-wrap gap-1">
              {strengths.map((t) => (
                <span
                  key={t.topic}
                  className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700"
                >
                  {t.topic}
                  <ConfidenceDots confidence={t.confidence} />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {weaknesses.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Needs Help
            </p>
            <div className="flex flex-wrap gap-1">
              {weaknesses.map((t) => (
                <span
                  key={t.topic}
                  className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700"
                >
                  {t.topic}
                  <ConfidenceDots confidence={t.confidence} />
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Confidence Dots                                             */
/* ─────────────────────────────────────────────────────────── */

function ConfidenceDots({ confidence }: { confidence: number }) {
  return (
    <span className="ml-1 inline-flex gap-0.5" aria-label={`Confidence ${confidence} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            i < confidence ? "bg-current opacity-80" : "bg-current opacity-20"
          }`}
        />
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Complementarity Chart                                       */
/* ─────────────────────────────────────────────────────────── */

function ComplementarityChart({
  members,
  accentColour,
}: {
  members: MemberProfile[];
  accentColour: string;
}) {
  // Collect all topics across members
  const allTopics = new Map<string, Map<string, number>>();
  for (const member of members) {
    for (const t of member.topics) {
      if (!allTopics.has(t.topic)) {
        allTopics.set(t.topic, new Map());
      }
      allTopics.get(t.topic)!.set(member.user_id, t.confidence);
    }
  }

  const topicNames = Array.from(allTopics.keys()).sort();

  if (topicNames.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No topic data available yet.
      </p>
    );
  }

  // Generate distinct colors for each member
  const memberColors = members.map((_, i) => {
    const hue = (i * 360) / Math.max(members.length, 1);
    return `hsl(${hue}, 65%, 50%)`;
  });

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {members.map((m, i) => (
          <div key={m.user_id} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: memberColors[i] }}
            />
            <span className="text-xs text-muted-foreground">
              {m.display_name.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Bars per topic */}
      <div className="space-y-3">
        {topicNames.map((topic) => {
          const memberMap = allTopics.get(topic)!;
          return (
            <div key={topic} className="space-y-1">
              <p className="text-xs font-medium">{topic}</p>
              <div className="flex items-center gap-1">
                {members.map((m, i) => {
                  const confidence = memberMap.get(m.user_id) ?? 0;
                  return (
                    <div
                      key={m.user_id}
                      className="flex-1"
                      title={`${m.display_name}: ${confidence}/5`}
                    >
                      <div className="h-3 w-full rounded-full bg-muted">
                        <div
                          className="h-3 rounded-full transition-all"
                          style={{
                            width: `${(confidence / 5) * 100}%`,
                            backgroundColor:
                              confidence === 0
                                ? "transparent"
                                : confidence >= 4
                                  ? memberColors[i]
                                  : confidence <= 2
                                    ? `${memberColors[i]}80`
                                    : `${memberColors[i]}b0`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Complementarity note */}
      <p className="text-[11px] text-muted-foreground">
        Bars show each member&apos;s confidence (1-5) per topic. Strong bars next to
        weak ones indicate complementarity — members can help each other where
        gaps exist.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Session Card                                                */
/* ─────────────────────────────────────────────────────────── */

function SessionCard({
  session,
  accentColour,
}: {
  session: SessionRow;
  accentColour: string;
}) {
  const dateObj = new Date(session.date + "T00:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const startFormatted = formatTime(session.start_time);
  const endFormatted = formatTime(session.end_time);
  const rsvpCount = session.attendance?.length ?? 0;
  const room = session.rooms;

  return (
    <a
      href={`/sessions/${session.id}`}
      className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: accentColour }}
            />
            <span className="text-sm font-medium line-clamp-1">{session.topic}</span>
          </div>
          {session.goal && (
            <p className="text-xs text-muted-foreground line-clamp-1">{session.goal}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{formattedDate}</span>
          <span>
            {startFormatted} – {endFormatted}
          </span>
          {room && (
            <span className="font-medium text-foreground">
              {room.name}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {rsvpCount} RSVP
          </span>
        </div>
      </div>
    </a>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Helpers                                                     */
/* ─────────────────────────────────────────────────────────── */

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:${minutes} ${suffix}`;
}
