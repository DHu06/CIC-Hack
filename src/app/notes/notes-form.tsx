"use client";

import { useActionState } from "react";
import { Loader2, BookOpen, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { uploadNotes, type UploadResult } from "./actions";
import type { CourseOption } from "./page";

interface NotesFormProps {
  courses: CourseOption[];
}

const CONFIDENCE_COLORS: Record<number, string> = {
  1: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  2: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  3: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
  4: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  5: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  learning: {
    label: "Learning",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
  reviewing: {
    label: "Reviewing",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  stuck: {
    label: "Stuck",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
};

const PACE_DISPLAY: Record<string, { label: string; icon: string }> = {
  behind: { label: "Behind pace", icon: "🐢" },
  on_track: { label: "On track", icon: "✅" },
  ahead: { label: "Ahead of pace", icon: "🚀" },
};

function ConfidenceDots({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`Confidence: ${level} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`inline-block size-1.5 rounded-full ${
            i < level ? "bg-current opacity-100" : "bg-current opacity-20"
          }`}
        />
      ))}
    </span>
  );
}

export function NotesForm({ courses }: NotesFormProps) {
  const [state, formAction, isPending] = useActionState<UploadResult, FormData>(
    uploadNotes,
    {}
  );

  const prevErrorRef = useRef<string | undefined>(undefined);

  // Show error toast when state.error changes
  useEffect(() => {
    if (state.error && state.error !== prevErrorRef.current) {
      toast.error(state.error);
    }
    prevErrorRef.current = state.error;
  }, [state.error]);

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5" />
            Paste Your Notes
          </CardTitle>
          <CardDescription>
            Paste your course notes, lecture summaries, or study material. Minimum 100
            characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {/* Course Selector */}
            <div className="space-y-2">
              <Label htmlFor="courseId">Course</Label>
              {courses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No courses found. Please complete onboarding first.
                </p>
              ) : (
                <select
                  id="courseId"
                  name="courseId"
                  required
                  disabled={isPending}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} — {course.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Notes Textarea */}
            <div className="space-y-2">
              <Label htmlFor="rawText">Notes</Label>
              <Textarea
                id="rawText"
                name="rawText"
                placeholder="Paste your course notes here... (minimum 100 characters)"
                required
                minLength={100}
                disabled={isPending}
                className="min-h-48 resize-y"
              />
              <p className="text-xs text-muted-foreground">
                We&apos;ll analyze your notes to identify topics, gauge your confidence
                levels, and determine your learning pace.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isPending || courses.length === 0}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analyzing your notes…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Extract Topics
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {state.success && state.topics && (
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              Your Topic Profile
            </CardTitle>
            <CardDescription>
              Here&apos;s what we identified from your notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Pace */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3">
              <span className="text-lg">
                {PACE_DISPLAY[state.topics.overall_pace]?.icon ?? "📊"}
              </span>
              <span className="text-sm font-medium">
                {PACE_DISPLAY[state.topics.overall_pace]?.label ?? state.topics.overall_pace}
              </span>
            </div>

            {/* Topic Chips */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Topics Identified
              </h3>
              <div className="flex flex-wrap gap-2">
                {state.topics.topics.map((topic) => (
                  <div
                    key={topic.topic}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      CONFIDENCE_COLORS[topic.confidence] ?? CONFIDENCE_COLORS[3]
                    }`}
                  >
                    <span>{topic.topic}</span>
                    <ConfidenceDots level={topic.confidence} />
                    <span
                      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        STATUS_LABELS[topic.status]?.className ?? ""
                      }`}
                    >
                      {STATUS_LABELS[topic.status]?.label ?? topic.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {state.topics.summary && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Summary
                </h3>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {state.topics.summary}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
