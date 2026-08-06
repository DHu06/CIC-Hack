# StudyHall UBC

AI-powered complementary study groups for UBC students. Upload your course notes, get matched with classmates who complement your strengths, and study smarter together.

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **Supabase project** with:
  - Project URL
  - Anon (public) key
  - Service role key
- **Anthropic API key** (for AI features; not required for seeding)

## Setup

```bash
# Clone the repository
git clone <repo-url>
cd CIC-Hack

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

Edit `.env.local` and fill in your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-key
```

### Database Setup

Apply the migrations to your Supabase project (via the Supabase dashboard SQL editor or CLI):

1. `supabase/migrations/00001_initial_schema.sql` - Tables, RLS, indexes
2. `supabase/migrations/00002_email_domain_trigger.sql` - @student.ubc.ca enforcement
3. `supabase/migrations/00003_rls_policies.sql` - Row Level Security policies

Then seed with sample data:

```bash
npm run seed
```

> **Note:** `npm run seed` does not require an Anthropic API key. It uses pre-computed topic profiles, pre-formed study groups, and pre-generated sessions rather than calling the live AI pipeline.

## Running

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run tests
npm test

# Seed database with sample data
npm run seed

# Lint
npm run lint
```

## Architecture

```
Next.js App Router + Supabase + Anthropic AI
```

The application follows a server-first architecture:

- **React Server Components** fetch data directly from Supabase on the server
- **Server Actions** handle form submissions and mutations
- **AI Pipeline** runs exclusively on the server (Anthropic SDK never reaches the client bundle)
- **Supabase Realtime** powers live attendance updates via client-side subscriptions
- **Row Level Security (RLS)** enforces all access control at the database layer

### How It Works

1. Students sign in with their `@student.ubc.ca` email (OTP)
2. During onboarding, they select their courses
3. They upload/paste course notes, which the AI analyzes for topic confidence
4. The matching algorithm forms groups of 4-6 students with **complementary** strengths (not similar ones)
5. AI generates a 6-session study timeline for each group
6. Students RSVP to sessions and check in with a 4-digit code
7. Attendance updates appear in real time across all connected browsers

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui |
| Database | Supabase (Postgres) |
| Auth | Supabase Email OTP (`@supabase/ssr`) |
| Realtime | Supabase Realtime (WebSocket subscriptions) |
| AI | Anthropic Claude (topic extraction, group naming, timeline generation) |
| Validation | Zod |
| Testing | Vitest, fast-check (property-based testing) |
| Notifications | Sonner (shadcn/ui toast) |

## Folder Structure

```
src/
  app/                    # Next.js App Router pages and layouts
    auth/                 # Email OTP sign-in
    onboarding/           # Profile setup (name, year, program, courses)
    subjects/             # Subject index + detail pages
    notes/                # Note upload + topic extraction
    groups/[id]/          # Study group detail page
    sessions/[id]/        # Session detail + RSVP + check-in
    me/                   # User's upcoming sessions
  components/
    nav.tsx               # Responsive navigation
    ui/                   # shadcn/ui primitives
  hooks/
    use-attendance.ts     # Realtime attendance subscription
  lib/
    ai/
      extract.ts          # Topic extraction (Anthropic)
      match.ts            # Complementarity scoring + greedy group formation
      match-orchestrator.ts # Full matching pipeline
      sessions.ts         # Session generation utilities
      timeline.ts         # AI timeline generation
    auth/
      helpers.ts          # requireAuth(), requireOnboarded(), getOptionalUser()
      validate.ts         # Email domain validation
    supabase/
      client.ts           # Browser Supabase client
      server.ts           # Server Supabase client
    env.ts                # Zod-validated environment variables
    utils.ts              # Utility functions (cn, etc.)
  middleware.ts           # Session refresh + onboarding redirect
scripts/
  seed.ts                 # Database seed script (40 students, groups, sessions)
supabase/
  migrations/             # SQL migrations
  seed.sql                # Reference data (subjects, courses, rooms)
```

## Key Design Decisions

See [DECISIONS.md](./DECISIONS.md) for detailed design rationale.

## License

See [LICENSE](./LICENSE).
