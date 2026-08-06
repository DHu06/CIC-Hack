"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface SessionClientProps {
  session: any;
  initialAttendees: any[];
}

export function SessionClient({ session, initialAttendees }: SessionClientProps) {
  const [attendees, setAttendees] = useState(initialAttendees);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  // Poll attendance every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiUrl}/sessions/${session.id}/attendance`);
        if (res.ok) {
          const data = await res.json();
          setAttendees(data.attendees);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [session.id, apiUrl]);

  const handleRsvp = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/sessions/${session.id}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "demo-user" }),
      });
      if (res.ok) toast.success("RSVP confirmed!");
      else toast.error("Failed to RSVP");
    } catch { toast.error("Network error"); }
    setLoading(false);
  }, [session.id, apiUrl]);

  const handleCheckIn = useCallback(async () => {
    if (code.length !== 4) { toast.error("Enter 4-digit code"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/sessions/${session.id}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "demo-user", code }),
      });
      const data = await res.json();
      if (res.ok) toast.success("Checked in!");
      else toast.error(data.error || "Invalid code");
    } catch { toast.error("Network error"); }
    setLoading(false);
    setCode("");
  }, [session.id, code, apiUrl]);

  const rsvpCount = attendees.filter((a: any) => a.status === "rsvp").length;
  const checkedInCount = attendees.filter((a: any) => a.status === "checked_in").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">{session.topic}</h1>
        {session.goal && <p className="text-sm text-muted-foreground mt-1">{session.goal}</p>}
        <p className="text-sm text-muted-foreground mt-2">{session.date} · {session.start_time} – {session.end_time}</p>
        <span className="inline-flex mt-2 items-center rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: session.subject_colour }}>{session.subject_name}</span>
      </div>

      <Card>
        <CardHeader><CardTitle>Room</CardTitle></CardHeader>
        <CardContent>
          <p className="font-medium">{session.room_name}</p>
          <p className="text-sm text-muted-foreground">{session.room_building}{session.room_floor ? ` · Floor ${session.room_floor}` : ""}</p>
          <p className="text-sm text-muted-foreground">Capacity: {session.room_capacity}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Attendance ({rsvpCount + checkedInCount})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-4 text-sm">
            <span>{rsvpCount} RSVP'd</span>
            <span>{checkedInCount} Checked In</span>
          </div>
          {attendees.map((a: any) => (
            <div key={a.id} className="flex items-center gap-2 text-sm">
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{a.display_name?.[0]}</span>
              <span>{a.display_name}</span>
              <span className="text-xs text-muted-foreground">({a.status})</span>
            </div>
          ))}
          <Button onClick={handleRsvp} disabled={loading} className="w-full mt-3">RSVP</Button>
          <div className="flex gap-2 mt-2">
            <Input value={code} onChange={e => setCode(e.target.value)} maxLength={4} placeholder="4-digit code" className="flex-1" />
            <Button onClick={handleCheckIn} disabled={loading} variant="secondary">Check In</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Group</CardTitle></CardHeader>
        <CardContent>
          <p className="font-medium">{session.group_name}</p>
          <a href={`/groups/${session.group_id}`} className="text-sm text-primary hover:underline">View group →</a>
        </CardContent>
      </Card>
    </div>
  );
}
