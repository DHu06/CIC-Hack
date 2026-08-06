"use client";

import { useState, useRef, useCallback } from "react";
import {
  MapPin,
  Users,
  Clock,
  CalendarDays,
  Building2,
  ExternalLink,
  CheckCircle2,
  Loader2,
  UserCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAttendance } from "@/hooks/use-attendance";
import { rsvpSession, checkIn, cancelRsvp } from "@/app/sessions/actions";

interface SessionClientProps {
  sessionId: string;
  date: string;
  startTime: string;
  endTime: string;
  topic: string;
  goal: string | null;
  status: string;
  room: {
    id: string;
    name: string;
    building: string;
    floor: string | null;
    capacity: number;
    map_url: string | null;
  };
  group: {
    id: string;
    name: string;
    rationale: string | null;
    course_id: string;
  };
  subject: {
    id: string;
    code: string;
    name: string;
    colour: string;
  };
  courseName: string;
  userId: string;
  initialUserStatus: "rsvp" | "checked_in" | null;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  scheduled: {
    label: "Scheduled",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
  completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes} ${ampm}`;
}

export function SessionClient({
  sessionId,
  date,
  startTime,
  endTime,
  topic,
  goal,
  status,
  room,
  group,
  subject,
  courseName,
  userId,
  initialUserStatus,
}: SessionClientProps) {
  const { rsvpCount, checkedInCount, attendees, isLoading } =
    useAttendance(sessionId);

  const [userStatus, setUserStatus] = useState<
    "rsvp" | "checked_in" | null
  >(initialUserStatus);
  const [isRsvpLoading, setIsRsvpLoading] = useState(false);
  const [isCheckInLoading, setIsCheckInLoading] = useState(false);
  const [codeDigits, setCodeDigits] = useState(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Keep userStatus in sync with realtime updates
  const currentUserAttendee = attendees.find((a) => a.userId === userId);
  const effectiveStatus = currentUserAttendee?.status ?? userStatus;

  const handleRsvp = useCallback(async () => {
    setIsRsvpLoading(true);
    const result = await rsvpSession(sessionId);
    setIsRsvpLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setUserStatus("rsvp");
      toast.success("You're in! RSVP confirmed.");
    }
  }, [sessionId]);

  const handleCancelRsvp = useCallback(async () => {
    setIsRsvpLoading(true);
    const result = await cancelRsvp(sessionId);
    setIsRsvpLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setUserStatus(null);
      toast.success("RSVP cancelled.");
    }
  }, [sessionId]);

  const handleCheckIn = useCallback(async () => {
    const code = codeDigits.join("");
    if (code.length !== 4) {
      toast.error("Please enter the full 4-digit code.");
      return;
    }

    setIsCheckInLoading(true);
    const result = await checkIn(sessionId, code);
    setIsCheckInLoading(false);

    if (result.error) {
      toast.error(result.error);
      setCodeDigits(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      setUserStatus("checked_in");
      toast.success("Checked in successfully!");
    }
  }, [sessionId, codeDigits]);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow single digits
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const newDigits = [...codeDigits];
    newDigits[index] = digit;
    setCodeDigits(newDigits);

    // Auto-advance to next input
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 4);
    if (pasted.length > 0) {
      const newDigits = [...codeDigits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setCodeDigits(newDigits);
      const focusIndex = Math.min(pasted.length, 3);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const statusBadge = STATUS_BADGE[status] ?? STATUS_BADGE.scheduled;

  return (
    <div className="space-y-6">
      {/* Header: Topic + Date/Time + Status */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{topic}</h1>
            {goal && (
              <p className="text-sm text-muted-foreground">{goal}</p>
            )}
          </div>
          <span
            className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge.className}`}
          >
            {statusBadge.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {formatDate(date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" />
            {formatTime(startTime)} – {formatTime(endTime)}
          </span>
        </div>

        {/* Course + Subject badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: subject.colour }}
          >
            {subject.name}
          </span>
          {courseName && (
            <span className="text-sm text-muted-foreground">{courseName}</span>
          )}
        </div>
      </div>

      {/* Room Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5" />
            Room Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">{room.name}</p>
              <p className="text-sm text-muted-foreground">
                {room.building}
                {room.floor && ` · Floor ${room.floor}`}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                <Users className="mr-1 inline size-3.5" />
                Capacity: {room.capacity}
              </p>
              {room.map_url && (
                <a
                  href={room.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  <MapPin className="size-3.5" />
                  View on Map
                  <ExternalLink className="size-3" />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendees Section (Realtime) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Attendees
          </CardTitle>
          <CardDescription>
            Live attendance — updates in real time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Counts */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex size-2 rounded-full bg-blue-500" />
              <span className="font-medium">{isLoading ? "–" : rsvpCount}</span>
              <span className="text-muted-foreground">RSVP&apos;d</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex size-2 rounded-full bg-green-500" />
              <span className="font-medium">
                {isLoading ? "–" : checkedInCount}
              </span>
              <span className="text-muted-foreground">Checked In</span>
            </div>
          </div>

          {/* Attendee List */}
          {isLoading ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading attendees...
            </div>
          ) : attendees.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              No attendees yet. Be the first to RSVP!
            </p>
          ) : (
            <div className="space-y-2">
              {attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2"
                >
                  {/* Avatar */}
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase">
                    {attendee.displayName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">
                      {attendee.displayName}
                      {attendee.userId === userId && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </p>
                  </div>
                  {/* Status indicator */}
                  {attendee.status === "checked_in" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                      <CheckCircle2 className="size-3.5" />
                      Checked in
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                      <UserCheck className="size-3.5" />
                      RSVP&apos;d
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions: RSVP / Cancel / Check-in */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* RSVP / Cancel Button */}
          {effectiveStatus === "checked_in" ? (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-900/20">
              <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                You&apos;re checked in!
              </span>
            </div>
          ) : effectiveStatus === "rsvp" ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
                <UserCheck className="size-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  You&apos;re RSVP&apos;d
                </span>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCancelRsvp}
                disabled={isRsvpLoading}
              >
                {isRsvpLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <XCircle className="size-4" />
                )}
                Cancel RSVP
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              size="lg"
              onClick={handleRsvp}
              disabled={isRsvpLoading || status !== "scheduled"}
            >
              {isRsvpLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  RSVPing...
                </>
              ) : (
                <>
                  <UserCheck className="size-4" />
                  RSVP to this session
                </>
              )}
            </Button>
          )}

          {/* Check-in Code Section */}
          {effectiveStatus !== "checked_in" && status === "scheduled" && (
            <div className="space-y-3 border-t pt-4">
              <div>
                <h3 className="text-sm font-semibold">Check In</h3>
                <p className="text-xs text-muted-foreground">
                  Enter the 4-digit code shown at the session location
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 justify-center">
                {codeDigits.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(index, e)}
                    onPaste={index === 0 ? handleDigitPaste : undefined}
                    className="size-11 text-center text-lg font-bold sm:size-12"
                    aria-label={`Digit ${index + 1}`}
                    disabled={isCheckInLoading}
                  />
                ))}
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleCheckIn}
                disabled={
                  isCheckInLoading || codeDigits.join("").length !== 4
                }
              >
                {isCheckInLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Check In
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Group Info */}
      <Card>
        <CardHeader>
          <CardTitle>Study Group</CardTitle>
          <CardDescription>{group.name}</CardDescription>
        </CardHeader>
        <CardContent>
          {group.rationale && (
            <p className="text-sm text-muted-foreground">{group.rationale}</p>
          )}
          <a
            href={`/groups/${group.id}`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View group details
            <ExternalLink className="size-3" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
