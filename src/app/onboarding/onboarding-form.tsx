"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { completeOnboarding, type OnboardingState } from "./actions";
import type { CourseWithSubject } from "./page";

interface CourseGroup {
  subjectName: string;
  colour: string;
  courses: CourseWithSubject[];
}

interface OnboardingFormProps {
  groupedCourses: CourseGroup[];
}

export function OnboardingForm({ groupedCourses }: OnboardingFormProps) {
  const [state, formAction, isPending] = useActionState<
    OnboardingState,
    FormData
  >(completeOnboarding, {});

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Welcome to StudyHall
        </CardTitle>
        <CardDescription>
          Set up your profile and select your courses to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state.error && (
            <div
              className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {state.error}
            </div>
          )}

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              name="display_name"
              type="text"
              placeholder="How should others see you?"
              required
              disabled={isPending}
            />
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <select
              id="year"
              name="year"
              required
              disabled={isPending}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select your year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
              <option value="5">5th Year+</option>
            </select>
          </div>

          {/* Program */}
          <div className="space-y-2">
            <Label htmlFor="program">Program</Label>
            <Input
              id="program"
              name="program"
              type="text"
              placeholder="e.g. Computer Science, Biology"
              required
              disabled={isPending}
            />
          </div>

          {/* Course Selection */}
          <div className="space-y-3">
            <Label>Courses</Label>
            <p className="text-sm text-muted-foreground">
              Select the courses you&apos;re taking this term.
            </p>
            <div className="space-y-4 max-h-80 overflow-y-auto rounded-md border p-4">
              {groupedCourses.map((group) => (
                <div key={group.subjectName} className="space-y-2">
                  <h3
                    className="text-sm font-semibold flex items-center gap-2"
                    style={{ color: group.colour }}
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: group.colour }}
                    />
                    {group.subjectName}
                  </h3>
                  <div className="grid gap-2 pl-5">
                    {group.courses.map((course) => (
                      <label
                        key={course.id}
                        className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent cursor-pointer transition-colors"
                      >
                        <Checkbox
                          name="courses"
                          value={course.id}
                          disabled={isPending}
                        />
                        <span className="text-sm">
                          <span className="font-medium">{course.code}</span>
                          <span className="text-muted-foreground ml-1.5">
                            {course.title}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Setting up your profile…
              </>
            ) : (
              "Complete Setup"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
