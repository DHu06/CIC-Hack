# Implementation Plan: StudyHall UBC

## Overview

Build StudyHall UBC following the specified 9-step build order. Each step produces a committable, runnable state. The stack is Next.js 15+ App Router, TypeScript, Supabase, Tailwind + shadcn/ui, Anthropic SDK, and Zod. Property-based tests use fast-check with Vitest.

## Tasks

- [x] 1. Project scaffold, Tailwind, shadcn, Supabase client wiring, env var loading
  - [x] 1.1 Initialize Next.js 15+ project with TypeScript, App Router, Tailwind CSS, and shadcn/ui
    - Run `npx create-next-app@latest` with TypeScript, Tailwind, App Router, src/ directory
    - Install shadcn/ui and initialize with `npx shadcn@latest init`
    - Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `@anthropic-ai/sdk`, `zod`, `fast-check`, `vitest`
    - Create `.env.example` with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY
    - Create `.env.local` from example (gitignored)
    - _Requirements: 10.4_

  - [x] 1.2 Set up Supabase client utilities and middleware
    - Create `lib/supabase/server.ts` with `createServerClient()` using `@supabase/ssr`
    - Create `lib/supabase/client.ts` with `createBrowserClient()` for client components
    - Create `middleware.ts` for session refresh using `updateSession()`
    - Ensure service role key is only used in server-side code
    - _Requirements: 10.1, 10.2_

  - [x] 1.3 Create base layout, theme configuration, and app shell
    - Set up root layout with Tailwind, font loading, metadata
    - Create a basic app shell with navigation placeholder
    - Add shadcn/ui Toaster component for error toasts
    - Verify `npm run build` passes with zero errors
    - _Requirements: 12.1_

- [x] 2. Database schema + migrations + seed script
  - [x] 2.1 Create Supabase migration for all database tables
    - Write SQL migration in `supabase/migrations/` with all tables: profiles, subjects, courses, enrollments, note_uploads, topic_profiles, study_groups, group_members, rooms, sessions, attendance
    - Enable RLS on every table
    - Add indexes on sessions(date), sessions(group_id), attendance(session_id), enrollments(user_id)
    - Add unique constraints as specified in schema
    - _Requirements: 9.1_

  - [x] 2.2 Create Postgres trigger to enforce @student.ubc.ca email domain
    - Write trigger function on auth.users INSERT that raises exception if email doesn't end in @student.ubc.ca
    - Include in migration file
    - _Requirements: 1.3_

  - [x] 2.3 Create RLS policies for all tables
    - profiles: users can read all, write only own
    - subjects/courses/rooms: anyone can read, no public write
    - enrollments: users can read/write own
    - note_uploads: users can read/write own only (no access to others' notes)
    - topic_profiles: users can read own, write own
    - study_groups/group_members: authenticated can read their groups, write via service role only
    - sessions: authenticated can read, write via service role only
    - attendance: authenticated can read session attendees, write own
    - _Requirements: 9.2, 9.3, 9.4, 9.5_

  - [x] 2.4 Create seed SQL and TypeScript seed script
    - Create `supabase/seed.sql` with 8 subjects, 3 courses each, 10 UBC campus rooms
    - Create `scripts/seed.ts` for 40 fake students with realistic note text for 24+ students across 6 courses
    - Make seed idempotent (use ON CONFLICT DO NOTHING or upsert patterns)
    - Add `npm run seed` script to package.json
    - Seed sessions across today + next 5 days, several today
    - Pre-populate RSVPs with 3-6 attendees per session
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 3. Email OTP auth restricted to @student.ubc.ca, profile setup flow
  - [x] 3.1 Implement email validation utility and auth page
    - Create `lib/auth/validate.ts` with `validateUBCEmail(email: string): boolean`
    - Create `/auth` page with email input, client-side domain validation, OTP submission
    - Call Supabase `signInWithOtp` only for valid UBC emails
    - Display error for non-UBC emails before sending
    - _Requirements: 1.1, 1.2_

  - [ ]* 3.2 Write property test for email validation
    - **Property 1: Email domain validation**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 3.3 Implement onboarding flow
    - Create `/onboarding` page with form: display_name, year, program, course selection (multi-select from courses table)
    - Server action to create profile, set onboarded=true, create enrollment records
    - Add middleware check: if authenticated but not onboarded, redirect to /onboarding
    - _Requirements: 2.1, 2.2, 2.3, 1.5_

  - [x] 3.4 Implement auth helpers and session management
    - Create `requireAuth()` helper that throws/redirects if not authenticated
    - Create `requireOnboarded()` helper that checks profile.onboarded
    - Wire into server components and server actions
    - _Requirements: 1.4, 1.5_

- [x] 4. Checkpoint - Auth and database foundation
  - Ensure `npm run build` passes, database migrations apply cleanly, auth flow works end-to-end. Ask the user if questions arise.

- [x] 5. Subject index + subject detail pages reading seeded data
  - [x] 5.1 Create subjects index page
    - Create `/subjects` page as React Server Component
    - Display grid of subject cards with name, colour accent, session counts, attendee counts
    - For authenticated users, pin enrolled subjects to top
    - For visitors, show all subjects without auth gate
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 5.2 Write property test for subject pinning logic
    - **Property 13: Subject pinning for enrolled students**
    - **Validates: Requirements 3.3**

  - [x] 5.3 Create subject detail page
    - Create `/subjects/[code]` page showing today's sessions, 7-day session strip, room information
    - Display status pills, session times, topics
    - Hide attendee names for unauthenticated visitors
    - _Requirements: 3.4, 3.5_

- [x] 6. Notes upload + AI topic extraction
  - [x] 6.1 Implement AI topic extraction pipeline
    - Create `lib/ai/extract.ts` with `extractTopics()` function
    - Define Zod schema for TopicExtraction response
    - Call Anthropic SDK with claude-sonnet-5, system prompt for topic extraction
    - Implement retry-once logic on Zod validation failure
    - _Requirements: 4.2, 4.4, 10.2, 10.3_

  - [ ]* 6.2 Write property test for topic extraction schema validation
    - **Property 11: AI response schema validation**
    - **Validates: Requirements 4.2, 10.3**

  - [x] 6.3 Create notes upload page and server action
    - Create `/notes` page with textarea for pasting notes, file upload option, course dropdown
    - Server action: store note_upload, call extractTopics, upsert topic_profile
    - Display extracted topic chips with confidence levels after processing
    - Show error toast on failure, preserve uploaded note
    - _Requirements: 4.1, 4.3, 4.5, 4.6_

- [x] 7. Group matching algorithm + group page
  - [x] 7.1 Implement complementarity scoring function
    - Create pure function `computeComplementarityScore(group: TopicVector[]): number` in `lib/ai/match.ts`
    - Implement topic spread calculation: sum of (max - min) per shared topic
    - Implement pace penalty: penalize pace spread > 1 step
    - Export as pure function for unit testing
    - _Requirements: 5.2, 5.3_

  - [ ]* 7.2 Write property tests for complementarity scoring
    - **Property 4: Complementarity score correctness**
    - **Property 5: Pace penalty monotonicity**
    - **Validates: Requirements 5.2, 5.3**

  - [x] 7.3 Implement greedy group formation algorithm
    - Create `greedyGroupFormation(vectors, minSize=4, maxSize=6): TopicVector[][]`
    - Implement greedy member addition maximizing complementarity
    - Implement `assignLeftovers()` for remaining students
    - Handle edge case: < 4 students returns empty
    - _Requirements: 5.1, 5.4, 5.5, 5.7_

  - [ ]* 7.4 Write property tests for group formation
    - **Property 2: Group member conservation**
    - **Property 3: Group size bounds**
    - **Validates: Requirements 5.1, 5.4, 5.5, 5.7**

  - [x] 7.5 Implement group matching orchestrator with AI naming
    - Create `matchGroups(courseId)` that queries topic_profiles, runs matching, calls AI for names
    - Define Zod schema for group naming response
    - Write study_groups and group_members to database
    - _Requirements: 5.6_

  - [x] 7.6 Create group page
    - Create `/groups/[id]` page showing members, their strengths/weaknesses, group rationale, timeline
    - Display each member's topic profile with visual confidence indicators
    - Show AI-generated group name and rationale
    - _Requirements: 5.6_

- [x] 8. Checkpoint - Matching algorithm verified
  - Ensure all tests pass including complementarity scoring tests. Run `npm test`. Ask the user if questions arise.

- [x] 9. AI timeline generation producing dated sessions with rooms
  - [x] 9.1 Implement timeline generation pipeline
    - Create `lib/ai/timeline.ts` with `generateTimeline()` function
    - Define Zod schema for TimelineResult (6 sessions, weekdays, time bounds)
    - Call Anthropic with group topic profiles, course code, date range
    - Validate output: exactly 6 sessions, weekdays only, 09:00-20:00, 90-min duration
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 9.2 Write property tests for timeline validation
    - **Property 6: Timeline validity**
    - **Property 7: Timeline topic ordering**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**

  - [x] 9.3 Implement room assignment and check-in code generation
    - Implement round-robin room assignment from available rooms
    - Generate unique 4-digit numeric check-in codes per session
    - Write sessions to database with room_id and checkin_code
    - _Requirements: 6.5, 6.6_

  - [ ]* 9.4 Write property tests for room assignment and check-in codes
    - **Property 8: Room round-robin distribution**
    - **Property 9: Check-in code format and uniqueness**
    - **Validates: Requirements 6.5, 6.6**

- [x] 10. RSVP + realtime attendee counts + 4-digit check-in
  - [x] 10.1 Implement RSVP and check-in server actions
    - Create server action `rsvpSession(sessionId)` that creates attendance record with status='rsvp'
    - Create server action `checkIn(sessionId, code)` that verifies code and updates to 'checked_in'
    - Reject incorrect check-in codes with validation error
    - Enforce uniqueness constraint on (session_id, user_id)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 10.2 Write property test for check-in code verification
    - **Property 10: Wrong check-in code rejection**
    - **Validates: Requirements 7.3**

  - [x] 10.3 Implement realtime attendance hook
    - Create `hooks/use-attendance.ts` with `useAttendance(sessionId)` hook
    - Subscribe to attendance table changes filtered by session_id
    - Update RSVP count and checked-in count in real time
    - Clean up subscription on unmount
    - Handle reconnection: refetch state on reconnect
    - _Requirements: 7.5, 7.6, 8.1, 8.2, 8.3_

  - [x] 10.4 Create session detail page
    - Create `/sessions/[id]` page with room info, map link, attendee list, RSVP button, check-in code input
    - Wire up realtime hook for live attendee count
    - Show RSVP and checked-in counts updating without refresh
    - _Requirements: 7.5, 7.6, 8.3_

- [x] 11. Checkpoint - Core features complete
  - Ensure all tests pass, realtime works across two browser tabs, RSVP updates immediately. Ask the user if questions arise.

- [x] 12. Polish pass: loading states, empty states, error toasts, mobile layout
  - [x] 12.1 Create landing page and navigation
    - Create `/` landing page with pitch copy, live sessions strip (today's sessions), sign-in CTA
    - Create `/me` page showing user's upcoming sessions
    - Build responsive navigation with mobile menu
    - _Requirements: 12.3_

  - [x] 12.2 Add loading states, empty states, and error handling
    - Add loading.tsx files for Suspense boundaries on all route segments
    - Add empty state components for: no subjects, no sessions, no groups, no notes
    - Wire error toasts using shadcn/ui Toast component on all server action failures
    - _Requirements: 12.4_

  - [x] 12.3 Mobile responsive polish
    - Ensure all pages render correctly at 390px viewport width
    - Test subject grid, session cards, group pages, forms at mobile breakpoint
    - Adjust spacing, font sizes, card layouts for mobile
    - _Requirements: 12.3_

  - [x] 12.4 Run seed through AI pipeline and verify end-to-end
    - Update seed script to run real AI pipeline over seed users (extractTopics for notes, matchGroups, generateTimeline)
    - Verify `npm run seed` completes successfully on fresh DB
    - Verify running seed twice is idempotent
    - _Requirements: 11.1, 11.2, 11.3_

  - [ ]* 12.5 Write property test for seed idempotence
    - **Property 12: Seed idempotence**
    - **Validates: Requirements 11.3**

- [x] 13. Final checkpoint - Definition of done
  - Verify all definition-of-done criteria: `npm run build` zero errors, `npm run seed` clean twice, `npm test` passes, @gmail.com rejected by trigger, note upload produces topic chips in 10s, matched group has 4-6 members with differing weak topics, timeline has 6 weekday sessions, RSVP updates in second browser, every page renders at 390px, no secrets in client bundle. Create README.md and DECISIONS.md. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases using Vitest
- The build order follows the user's specified 9-step sequence
- All AI calls are server-side only — never import Anthropic SDK in client components
- Use `@supabase/ssr` for cookie-based auth throughout

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3"] },
    { "id": 4, "tasks": ["2.4", "3.1"] },
    { "id": 5, "tasks": ["3.2", "3.3", "3.4"] },
    { "id": 6, "tasks": ["5.1", "5.3"] },
    { "id": 7, "tasks": ["5.2", "6.1"] },
    { "id": 8, "tasks": ["6.2", "6.3"] },
    { "id": 9, "tasks": ["7.1"] },
    { "id": 10, "tasks": ["7.2", "7.3"] },
    { "id": 11, "tasks": ["7.4", "7.5"] },
    { "id": 12, "tasks": ["7.6", "9.1"] },
    { "id": 13, "tasks": ["9.2", "9.3"] },
    { "id": 14, "tasks": ["9.4", "10.1"] },
    { "id": 15, "tasks": ["10.2", "10.3"] },
    { "id": 16, "tasks": ["10.4"] },
    { "id": 17, "tasks": ["12.1", "12.2", "12.3"] },
    { "id": 18, "tasks": ["12.4"] },
    { "id": 19, "tasks": ["12.5"] }
  ]
}
```
