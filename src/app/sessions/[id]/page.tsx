import { getSessionDetail } from "@/lib/api";
import { notFound } from "next/navigation";
import { SessionClient } from "./session-client";

export const dynamic = "force-dynamic";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let data: { session: any; attendees: any[] };
  try {
    data = await getSessionDetail(id);
  } catch {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <SessionClient session={data!.session} initialAttendees={data!.attendees} />
      </div>
    </div>
  );
}
