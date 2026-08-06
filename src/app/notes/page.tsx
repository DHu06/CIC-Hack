"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export default function NotesPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  const handleSubmit = async () => {
    if (text.trim().length < 100) { toast.error("Enter at least 100 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "demo-user", course_id: "b1000000-0000-0000-0000-000000000002", raw_text: text }),
      });
      const data = await res.json();
      if (res.ok && data.topics) { setResult(data); toast.success("Topics extracted!"); }
      else toast.error(data.error || "Extraction failed");
    } catch { toast.error("Network error"); }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Upload Notes</h1>
      <p className="text-sm text-muted-foreground mb-6">Paste your course notes and AI will extract your topic strengths and weaknesses.</p>
      
      <Card className="mb-6">
        <CardHeader><CardTitle>Paste Notes</CardTitle><CardDescription>Minimum 100 characters</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste your notes here..." className="min-h-48" />
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? <><Loader2 className="size-4 animate-spin" /> Analyzing...</> : <><Sparkles className="size-4" /> Extract Topics</>}
          </Button>
        </CardContent>
      </Card>

      {result && result.topics && (
        <Card className="border-2 border-primary/20">
          <CardHeader><CardTitle>Your Topic Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm"><strong>Pace:</strong> {result.overall_pace}</p>
            <p className="text-sm">{result.summary}</p>
            <div className="flex flex-wrap gap-2">
              {result.topics.map((t: any) => (
                <span key={t.topic} className={`rounded-full border px-3 py-1.5 text-sm font-medium ${t.confidence >= 4 ? "bg-green-50 text-green-800 border-green-200" : t.confidence <= 2 ? "bg-red-50 text-red-800 border-red-200" : "bg-yellow-50 text-yellow-800 border-yellow-200"}`}>
                  {t.topic} ({t.confidence}/5) · {t.status}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
