import { notFound } from "next/navigation";
import { requireOnboarded } from "@/lib/auth/helpers";
import { SessionClient } from "./session-client";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = await params;
  const { user, supabase } = await requireOnboarded();

  // Fetch session with room, group, and subject info
  const { data: session, error } = await supabase
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
      rooms (
        id,
        name,
        building,
        floor,
        capacity,
        map_url
      ),
      study_groups (
        id,
        name,
        rationale,
        course_id
      ),
      subjects (
        id,
        code,
        name,
        colour
      )
    `
    )
    .eq("id", sessionId)
    .single();

  if (error || !session) {
    notFound();
  }

  // Check user's current attendance status for this session
  const { data: userAttendance } = await supabase
    .from("attendance")
    .select("id, status")
    .eq("session_id", sessionId)
    .eq("user_id", user.id)
    .single();

  // Fetch course info from the group
  const group = session.study_groups as unknown as {
    id: string;
    name: string;
    rationale: string | null;
    course_id: string;
  };

  let courseName = "";
  if (group?.course_id) {
    const { data: course } = await supabase
      .from("courses")
      .select("code, title")
      .eq("id", group.course_id)
      .single();
    if (course) {
      courseName = `${course.code} — ${course.title}`;
    }
  }

  const room = session.rooms as unknown as {
    id: string;
    name: string;
    building: string;
    floor: string | null;
    capacity: number;
    map_url: string | null;
  };

  const subject = session.subjects as unknown as {
    id: string;
    code: string;
    name: string;
    colour: string;
  };

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-6">
        <SessionClient
          sessionId={session.id}
          date={session.date}
          startTime={session.start_time}
          endTime={session.end_time}
          topic={session.topic}
          goal={session.goal}
          status={session.status}
          room={room}
          group={group}
          subject={subject}
          courseName={courseName}
          userId={user.id}
          initialUserStatus={
            (userAttendance?.status as "rsvp" | "checked_in" | null) ?? null
          }
        />
      </div>
    </div>
  );
}
