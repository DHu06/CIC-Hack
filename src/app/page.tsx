export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          StudyHall UBC
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          AI-powered complementary study groups for UBC students. Upload your
          notes, get matched with classmates who complement your strengths, and
          study smarter together.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="/subjects"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Browse Subjects
          </a>
          <a
            href="/auth"
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
