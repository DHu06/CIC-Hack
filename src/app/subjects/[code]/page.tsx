import { notFound } from "next/navigation";
import { getOptionalUser } from "@/lib/auth/helpers";
import { SubjectDetailClient } from "./subject-detail-client";

export const dynamic = "force-dynamic";

interface SessionData {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  topic: string;
  goal: string | null;
  status: string;
  checkin_code: string;
  room: {
    name: string;
    building: string;
  };
  group: {
    id: string;
    course: {
      code: string;
    };
  };
  attendees: Array<{
    user_id: string;
    status: string;
    profile: {
      display_name: string;
    } | null;
  }>;
}

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const { user, supabase } = await getOptionalUser();

  // Fetch the subject by code
  const { data: subject } = await supabase
    .from("subjects")
    .select("id, code, name, colour")
    .eq("code", code.toUpperCase())
    .single();

  if (!subject) {
    notFound();
  }

  // Get the next 7 days starting from today
  const today = new Date();
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }

  // Fetch all sessions for this subject in the next 7 days
  const { data: sessions } = await supabase
    .from("sessions")
    .select(
      `
      id,
      date,
      start_time,
      end_time,
      topic,
      goal,
      status,
      checkin_code,
      room:rooms!inner(name, building),
      group:study_groups!inner(id, course:courses!inner(code))
    `
    )
    .eq("subject_id", subject.id)
    .gte("date", days[0])
    .lte("date", days[6])
    .order("date")
    .order("start_time");

  // Fetch attendance for these sessions
  const sessionIds = (sessions ?? []).map((s) => s.id);
  let attendanceBySession: Record<
    string,
    Array<{ user_id: string; status: string; display_name: string }>
  > = {};

  if (sessionIds.length > 0) {
    const { data: attendance } = await supabase
      .from("attendance")
      .select("session_id, user_id, status, profiles!inner(display_name)")
      .in("session_id", sessionIds);

    if (attendance) {
      for (const a of attendance) {
        if (!attendanceBySession[a.session_id]) {
          attendanceBySession[a.session_id] = [];
        }
        const profile = a.profiles as unknown as { display_name: string } | null;
        attendanceBySession[a.session_id].push({
          user_id: a.user_id,
          status: a.status,
          display_name: profile?.display_name ?? "Anonymous",
        });
      }
    }
  }

  // Build session data for client
  const sessionsData: SessionData[] = (sessions ?? []).map((s) => {
    const room = s.room as unknown as { name: string; building: string };
    const group = s.group as unknown as {
      id: string;
      course: { code: string };
    };
    const attendees = (attendanceBySession[s.id] ?? []).map((a) => ({
      user_id: a.user_id,
      status: a.status,
      profile: { display_name: a.display_name },
    }));

    return {
      id: s.id,
      date: s.date,
      start_time: s.start_time,
      end_time: s.end_time,
      topic: s.topic,
      goal: s.goal,
      status: s.status,
      checkin_code: s.checkin_code,
      room,
      group: { id: group.id, course: { code: group.course.code } },
      attendees,
    };
  });

  // Count sessions per day for the strip indicators
  const sessionsPerDay: Record<string, number> = {};
  for (const s of sessionsData) {
    sessionsPerDay[s.date] = (sessionsPerDay[s.date] ?? 0) + 1;
  }

  return (
    <SubjectDetailClient
      subject={subject}
      sessions={sessionsData}
      days={days}
      sessionsPerDay={sessionsPerDay}
      isAuthenticated={!!user}
    />
  );
}
