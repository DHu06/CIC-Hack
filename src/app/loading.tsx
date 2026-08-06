export default function Loading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero skeleton */}
      <section className="flex flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto w-full max-w-2xl space-y-4 text-center">
          <div className="mx-auto h-10 w-3/4 animate-pulse rounded-md bg-muted" />
          <div className="mx-auto h-5 w-2/3 animate-pulse rounded-md bg-muted" />
          <div className="mx-auto h-5 w-1/2 animate-pulse rounded-md bg-muted" />
          <div className="mt-8 flex justify-center gap-3">
            <div className="h-11 w-36 animate-pulse rounded-md bg-muted" />
            <div className="h-11 w-36 animate-pulse rounded-md bg-muted" />
          </div>
        </div>
      </section>

      {/* Sessions strip skeleton */}
      <section className="border-t border-border bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 h-6 w-40 animate-pulse rounded-md bg-muted" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="min-w-[240px] flex-shrink-0 rounded-lg border border-border bg-background p-4"
              >
                <div className="flex justify-between">
                  <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                </div>
                <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
                <div className="mt-2 h-3 w-24 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-3 w-32 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
