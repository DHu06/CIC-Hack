import Link from "next/link";
import { getSessions } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  let sessions: any[] = [];
  try {
    sessions = await getSessions();
  } catch { /* API not available yet */ }

  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Upload notes. Get matched.{" "}
            <span className="text-primary">Study smarter together.</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            AI-powered complementary study groups for UBC students.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/subjects" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
              Browse Subjects
            </Link>
            <Link href="/notes" className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium shadow-sm hover:bg-accent">
              Upload Notes
            </Link>
          </div>
        </div>
      </section>

      {sessions.length > 0 && (
        <section className="border-t bg-muted/30 px-4 py-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-4 text-lg font-semibold">Happening Today</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {sessions.slice(0, 10).map((s: any) => (
                <Link key={s.id} href={`/sessions/${s.id}`} className="flex min-w-[220px] flex-col gap-1 rounded-lg border bg-background p-4 shadow-sm hover:shadow-md">
                  <span className="text-xs font-medium text-primary">{s.course_code}</span>
                  <span className="text-sm font-semibold line-clamp-2">{s.topic}</span>
                  <span className="text-xs text-muted-foreground">{s.start_time} – {s.end_time}</span>
                  <span className="text-xs text-muted-foreground">{s.room_name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
