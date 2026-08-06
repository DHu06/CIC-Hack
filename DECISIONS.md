# Design Decisions

This document captures key architectural and implementation decisions made during development of StudyHall UBC.

## AI and Seeding

### Pre-computed topic profiles in seed instead of calling live API

The seed script (`scripts/seed.ts`) uses pre-computed `topic_profiles`, pre-formed study groups, and pre-generated sessions rather than invoking the Anthropic API. This means:

- `npm run seed` works without an `ANTHROPIC_API_KEY` set
- Seeding is deterministic and fast (no network calls to AI)
- CI/CD pipelines don't need expensive API keys for database setup
- The seed data is carefully crafted to demonstrate complementary matching (members strong where others are weak)

### Retry-once on AI validation failure

When the Anthropic API returns malformed JSON that fails Zod validation, the pipeline retries exactly once with the same prompt before surfacing an error. This handles the ~5% case where the LLM produces slightly malformed output.

## Next.js and React

### Used `force-dynamic` on all data-fetching pages

All pages that query Supabase use `export const dynamic = "force-dynamic"` to avoid Next.js attempting static generation during build. This is necessary because:

- Supabase calls require runtime environment variables (not available at build time)
- Auth-aware pages need to read cookies per-request
- Session data changes frequently, so caching provides no benefit

### Used `useActionState` for form submissions (React 19 pattern)

Forms use React 19's `useActionState` hook (formerly `useFormState`) for server action integration. This provides:

- Built-in pending states
- Progressive enhancement (forms work without JS)
- Type-safe action return values

### Used Next.js 16 with React 19

Chose the latest stable versions for access to React Server Components, Server Actions, `useActionState`, and improved streaming. The App Router provides natural code-splitting and server/client boundaries.

## UI and Notifications

### Used shadcn/ui Sonner (not the older shadcn Toast)

The project uses `sonner` (imported via `@/components/ui/sonner`) instead of the older `@radix-ui/react-toast` based shadcn Toast component. Sonner provides:

- Simpler API (`toast.success()`, `toast.error()`)
- Better stacking behavior
- Auto-dismiss with progress indicator
- No need for a separate toast context provider

### Used DiceBear API for deterministic avatar generation

Seed profiles use `https://api.dicebear.com/7.x/initials/svg?seed=Name` for avatars. This is:

- Deterministic (same name = same avatar)
- No file storage needed
- Works offline in seed (just a URL, rendered by browser)

## Database Design

### Stored topic_profiles as JSONB

The `topics` column in `topic_profiles` is stored as JSONB rather than a normalized topics table. This provides:

- Schema flexibility for varying numbers of topics per course
- Single-query reads (no joins needed)
- Easy AI pipeline writes (just serialize the Zod-validated output)
- Good enough query performance for class sizes < 500

### Used round-robin for room assignment

Sessions are assigned to rooms in round-robin order from the available rooms list. This is:

- The simplest fair distribution algorithm
- Ensures no room is overloaded
- Maximum difference between most-used and least-used room is 1
- No need for capacity-aware scheduling at MVP scale

## Algorithms

### Used greedy algorithm for group formation

The matching algorithm uses greedy member addition (maximizing complementarity at each step) rather than optimal algorithms. Rationale:

- Good enough for class sizes < 500 students
- O(n^2 * k) complexity where n = students, k = topics
- Optimal matching (e.g., branch-and-bound) would be NP-hard for arbitrary group sizes
- Greedy produces near-optimal results for the 4-6 member constraint

### Made check-in codes unique per timeline batch (not globally)

4-digit check-in codes are unique within a group's session timeline (6 sessions) but not globally unique across all sessions. This is acceptable because:

- Collision probability for 4-digit codes across different sessions is negligible
- Students only ever see codes for their own group's sessions
- Simpler implementation (no global uniqueness constraint in DB)

## Authentication and Security

### Used `@supabase/ssr` cookie pattern

Auth uses the `@supabase/ssr` package with cookie-based sessions rather than the deprecated `@supabase/auth-helpers-nextjs`. Benefits:

- Official recommended approach for Next.js App Router
- Works correctly with Server Components and Server Actions
- Middleware-based session refresh on every request
- No localStorage dependency (works in SSR)

### Profile creation happens during onboarding, not at auth signup

The `profiles` table row is created during the `/onboarding` step (after email verification), not via a database trigger on `auth.users` insert. This avoids:

- Race conditions between the trigger and the `@student.ubc.ca` email domain enforcement trigger
- Incomplete profiles (user signs up but hasn't provided name/year/program)
- Issues with Supabase's built-in email confirmation flow

### Email domain enforced at both client and database

The `@student.ubc.ca` domain is validated:

1. Client-side before sending the OTP request (immediate UX feedback)
2. Server-side via a Postgres trigger on `auth.users` (defense in depth)

## Testing

### Chose Vitest over Jest

Vitest was chosen as the test runner because:

- Native TypeScript support without separate compilation step
- Native ESM support (matches the Next.js module system)
- Fast execution with Vite's transform pipeline
- Compatible with Jest's API (easy migration if needed)
- `fast-check` integrates cleanly for property-based testing

## Build and Project Config

### Excluded `scripts/` from tsconfig paths

The `tsconfig.json` excludes the `scripts/` directory to prevent build issues:

- Seed scripts use Node.js APIs (`fs`, `path`) not available in the browser
- Scripts run standalone via `tsx` (no bundler needed)
- Prevents Next.js from trying to analyze/compile standalone scripts
