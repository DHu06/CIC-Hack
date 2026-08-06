import Link from "next/link";
import { getSubjectDetail } from "@/lib/api";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SubjectDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  
  let data: { subject: any; sessions: any[] };
  try {
    data = await getSubjectDetail(code);
  } catch {
    notFound();
  }

  const { subject, sessions } = data!;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: subject.colour }}>
          {subject.code.slice(0, 2)}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: subject.colour }}>{subject.code}</h1>
          <p className="text-muted-foreground">{subject.name}</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <p className="text-muted-foreground">No sessions scheduled.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s: any) => (
            <Link key={s.id} href={`/sessions/${s.id}`} className="flex flex-col rounded-xl border p-5 shadow-sm hover:shadow-md transition-all">
              <span className="text-xs font-medium" style={{ color: subject.colour }}>{s.course_code}</span>
              <span className="mt-1 font-semibold">{s.topic}</span>
              {s.goal && <span className="text-sm text-muted-foreground line-clamp-2">{s.goal}</span>}
              <span className="mt-2 text-xs text-muted-foreground">{s.date} · {s.start_time} – {s.end_time}</span>
              <span className="text-xs text-muted-foreground">{s.room_name}, {s.room_building}</span>
              <span className="mt-2 text-xs text-muted-foreground">{s.attendee_count || 0} attending</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
