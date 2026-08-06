export default function MySessionsLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-7 w-36 animate-pulse rounded-md bg-muted" />
      <div className="mt-1 h-4 w-72 animate-pulse rounded-md bg-muted" />

      <div className="mt-6 space-y-8">
        {/* Section header */}
        <div>
          <div className="mb-3 h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col gap-1.5 rounded-lg border border-border p-4"
              >
                <div className="flex justify-between">
                  <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-14 animate-pulse rounded-full bg-muted" />
                </div>
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
