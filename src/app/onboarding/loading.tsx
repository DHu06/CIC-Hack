export default function OnboardingLoading() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6 rounded-lg border border-border p-8">
        {/* Title */}
        <div className="space-y-2 text-center">
          <div className="mx-auto h-7 w-48 animate-pulse rounded-md bg-muted" />
          <div className="mx-auto h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {/* Display name */}
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </div>

          {/* Year */}
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </div>

          {/* Program */}
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </div>

          {/* Courses */}
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 animate-pulse rounded-md bg-muted"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}
