import Link from "next/link";
import { getSubjects } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  let subjects: any[] = [];
  try {
    subjects = await getSubjects();
  } catch { /* API not available */ }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Subjects</h1>
      <p className="mt-2 text-muted-foreground">Browse study sessions across UBC departments</p>
      
      {subjects.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No subjects available. Run seed to populate data.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {subjects.map((s: any) => (
            <Link key={s.id} href={`/subjects/${s.code}`} className="group flex flex-col rounded-xl border p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all" style={{ borderLeftColor: s.colour, borderLeftWidth: "4px" }}>
              <span className="text-2xl font-bold" style={{ color: s.colour }}>{s.code}</span>
              <span className="mt-1 text-sm text-muted-foreground">{s.name}</span>
              <span className="mt-3 text-xs text-muted-foreground">{s.session_count || 0} sessions today</span>
              {s.attendee_count > 0 && <span className="text-xs text-muted-foreground">{s.attendee_count} attendees</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
