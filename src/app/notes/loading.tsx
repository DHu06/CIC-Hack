export default function NotesLoading() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <div className="h-7 w-40 animate-pulse rounded-md bg-muted" />
          <div className="mt-1 h-4 w-80 animate-pulse rounded-md bg-muted" />
        </div>

        {/* Form skeleton */}
        <div className="space-y-4 rounded-lg border border-border p-6">
          {/* Course select */}
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-40 w-full animate-pulse rounded-md bg-muted" />
          </div>

          {/* Submit button */}
          <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}
