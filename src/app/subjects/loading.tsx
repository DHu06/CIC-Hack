export default function SubjectsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
        <div className="mt-2 h-5 w-64 animate-pulse rounded-md bg-muted" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm"
            style={{ borderLeftWidth: "4px", borderLeftColor: "#e5e7eb" }}
          >
            <div className="h-7 w-16 animate-pulse rounded-md bg-muted" />
            <div className="mt-1 h-4 w-24 animate-pulse rounded-md bg-muted" />
            <div className="mt-4 space-y-1.5">
              <div className="h-3 w-28 animate-pulse rounded bg-muted" />
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            </div>
            <div className="mt-3 h-5 w-24 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
