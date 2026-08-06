"use client";

import { useState } from "react";
import Link from "next/link";

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

interface SubjectDetailClientProps {
  subject: {
    id: string;
    code: string;
    name: string;
    colour: string;
  };
  sessions: SessionData[];
  days: string[];
  sessionsPerDay: Record<string, number>;
  isAuthenticated: boolean;
}

function formatTime(time: string): string {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const min = m === "00" ? "" : `:${m}`;
  if (hour === 0) return `12${min} AM`;
  if (hour < 12) return `${hour}${min} AM`;
  if (hour === 12) return `12${min} PM`;
  return `${hour - 12}${min} PM`;
}

function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

function getSessionStatus(
  date: string,
  startTime: string,
  endTime: string
): { label: string; variant: "live" | "upcoming" | "completed" | "scheduled" } {
  const now = new Date();
  const sessionStart = new Date(`${date}T${startTime}`);
  const sessionEnd = new Date(`${date}T${endTime}`);

  if (now >= sessionStart && now <= sessionEnd) {
    return { label: "Happening now", variant: "live" };
  }

  if (now < sessionStart) {
    const diffMs = sessionStart.getTime() - now.getTime();
    const diffMin = Math.round(diffMs / 60000);
    if (diffMin <= 60) {
      return { label: `Starting in ${diffMin}m`, variant: "upcoming" };
    }
    return { label: "Scheduled", variant: "scheduled" };
  }

  return { label: "Completed", variant: "completed" };
}

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function getDayNumber(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.getDate().toString();
}

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}

export function SubjectDetailClient({
  subject,
  sessions,
  days,
  sessionsPerDay,
  isAuthenticated,
}: SubjectDetailClientProps) {
  const [selectedDay, setSelectedDay] = useState<string>(days[0]);

  const filteredSessions = sessions.filter((s) => s.date === selectedDay);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: subject.colour }}
          >
            {subject.code.slice(0, 2)}
          </div>
          <div className="min-w-0">
            <h1
              className="text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ color: subject.colour }}
            >
              {subject.code}
            </h1>
            <p className="text-sm text-muted-foreground truncate">{subject.name}</p>
          </div>
        </div>
      </div>

      {/* 7-Day Strip */}
      <div className="mb-8 -mx-4 px-4 overflow-x-auto sm:mx-0 sm:px-0">
        <div className="flex gap-2 min-w-max pb-2">
          {days.map((day) => {
            const active = day === selectedDay;
            const today = isToday(day);
            const hasSessionsDot = (sessionsPerDay[day] ?? 0) > 0;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`relative flex flex-col items-center rounded-xl px-4 py-3 transition-all min-w-[64px] ${
                  active
                    ? "bg-foreground text-background shadow-md"
                    : today
                      ? "bg-primary/10 text-foreground border border-primary/30"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}
              >
                <span className="text-xs font-medium uppercase">
                  {getDayName(day)}
                </span>
                <span className="text-lg font-bold mt-0.5">
                  {getDayNumber(day)}
                </span>
                {hasSessionsDot && (
                  <span
                    className={`mt-1 h-1.5 w-1.5 rounded-full ${
                      active ? "bg-background" : "bg-primary"
                    }`}
                    style={
                      !active ? { backgroundColor: subject.colour } : undefined
                    }
                  />
                )}
                {today && !active && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sessions for selected day */}
      <div className="space-y-2 mb-4">
        <h2 className="text-lg font-semibold">
          {isToday(selectedDay)
            ? "Today's Sessions"
            : `Sessions for ${new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`}
        </h2>
        <p className="text-sm text-muted-foreground">
          {filteredSessions.length === 0
            ? "No sessions scheduled for this day"
            : `${filteredSessions.length} session${filteredSessions.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">
            No study sessions scheduled for this day.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check other days in the strip above.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              subjectColour={subject.colour}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({
  session,
  subjectColour,
  isAuthenticated,
}: {
  session: SessionData;
  subjectColour: string;
  isAuthenticated: boolean;
}) {
  const { label, variant } = getSessionStatus(
    session.date,
    session.start_time,
    session.end_time
  );
  const rsvpCount = session.attendees.length;

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Top row: course badge + status pill */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold text-white"
          style={{ backgroundColor: subjectColour }}
        >
          {session.group.course.code}
        </span>
        <StatusPill label={label} variant={variant} />
      </div>

      {/* Topic */}
      <h3 className="font-semibold text-base leading-tight mb-1 group-hover:text-primary transition-colors">
        {session.topic}
      </h3>
      {session.goal && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {session.goal}
        </p>
      )}

      {/* Time */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{formatTimeRange(session.start_time, session.end_time)}</span>
      </div>

      {/* Room */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <svg
          className="h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
          />
        </svg>
        <span className="line-clamp-1">
          {session.room.name} · {session.room.building}
        </span>
      </div>

      {/* Attendees */}
      <div className="mt-auto pt-3 border-t border-border">
        <div className="flex items-center gap-2 text-sm">
          <svg
            className="h-4 w-4 shrink-0 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.997m0 0A8.966 8.966 0 0112 15a8.966 8.966 0 00-2.213.272"
            />
          </svg>
          {isAuthenticated ? (
            <span className="text-muted-foreground">
              {rsvpCount === 0
                ? "No one attending yet"
                : rsvpCount === 1
                  ? `${session.attendees[0]?.profile?.display_name ?? "1 person"} attending`
                  : `${session.attendees
                      .slice(0, 2)
                      .map((a) => a.profile?.display_name ?? "Someone")
                      .join(", ")}${rsvpCount > 2 ? ` +${rsvpCount - 2} more` : ""}`}
            </span>
          ) : (
            <span className="text-muted-foreground">
              {rsvpCount === 0
                ? "No one attending yet"
                : `${rsvpCount} attending`}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function StatusPill({
  label,
  variant,
}: {
  label: string;
  variant: "live" | "upcoming" | "completed" | "scheduled";
}) {
  const classes = {
    live: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    upcoming:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    completed:
      "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400",
    scheduled:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes[variant]}`}
    >
      {variant === "live" && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
      )}
      {label}
    </span>
  );
}
