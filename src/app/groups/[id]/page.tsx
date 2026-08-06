import { getGroup } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let data: { group: any; members: any[]; sessions: any[] };
  try {
    data = await getGroup(id);
  } catch {
    notFound();
  }

  const { group, members, sessions } = data!;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold">{group.name}</h1>
        <span className="rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: group.subject_colour }}>{group.course_code}</span>
      </div>
      {group.rationale && <p className="text-sm text-muted-foreground mb-8">{group.rationale}</p>}

      <h2 className="text-xl font-semibold mb-4">Members</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {members.map((m: any) => (
          <div key={m.user_id} className="rounded-xl border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: group.subject_colour }}>{m.display_name?.[0]}</div>
              <span className="font-medium text-sm">{m.display_name}</span>
            </div>
            {m.topics && (
              <div className="flex flex-wrap gap-1 mt-2">
                {(m.topics as any[]).map((t: any) => (
                  <span key={t.topic} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${t.confidence >= 4 ? "bg-green-50 text-green-700" : t.confidence <= 2 ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-700"}`}>
                    {t.topic} ({t.confidence}/5)
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">Sessions</h2>
      {sessions.length === 0 ? (
        <p className="text-muted-foreground">No upcoming sessions.</p>
      ) : (
        <div className="space-y-3">
          {sessions.map((s: any) => (
            <Link key={s.id} href={`/sessions/${s.id}`} className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{s.topic}</span>
                  {s.goal && <p className="text-xs text-muted-foreground">{s.goal}</p>}
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <span>{s.date}</span><br/>
                  <span>{s.start_time} – {s.end_time}</span><br/>
                  <span>{s.room_name}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
