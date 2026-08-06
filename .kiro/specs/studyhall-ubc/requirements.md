# Requirements Document

## Introduction

StudyHall UBC enables verified UBC students to upload course notes, receive AI-extracted topic confidence profiles, get matched into complementary study groups, and participate in AI-generated study sessions with campus room assignments, RSVP, and check-in. The system enforces UBC student verification via email domain, uses complementarity-based matching (not similarity), and provides real-time attendance updates.

## Glossary

- **System**: The StudyHall UBC web application
- **Student**: A verified UBC student with a valid @student.ubc.ca email
- **Visitor**: An unauthenticated user browsing the application
- **Topic_Profile**: AI-extracted representation of a student's confidence across course topics
- **Complementarity_Score**: Numeric measure of how well group members' strengths cover each other's weaknesses
- **Study_Group**: A persistent group of 4-6 students in the same course with complementary topic profiles
- **Session**: A scheduled study meeting with date, time, room, topic, and check-in code
- **AI_Pipeline**: Server-side Anthropic API calls for topic extraction, group naming, and timeline generation
- **Matcher**: The algorithmic component that forms complementary study groups
- **Auth_System**: Supabase email OTP authentication restricted to @student.ubc.ca
- **Realtime_System**: Supabase Realtime subscriptions for live attendance updates
- **Check_In_Code**: A 4-digit numeric code for verifying physical presence at a session

## Requirements

### Requirement 1: Student Authentication

**User Story:** As a UBC student, I want to sign in with my student email, so that only verified UBC students can access protected features.

#### Acceptance Criteria

1. WHEN a user enters an email ending in @student.ubc.ca, THE Auth_System SHALL send an OTP to that email
2. WHEN a user enters an email not ending in @student.ubc.ca, THE Auth_System SHALL reject the sign-in attempt and display a domain validation error
3. WHEN a non-@student.ubc.ca email is inserted into auth.users, THE System SHALL reject the insert via a Postgres trigger
4. WHEN a user submits a valid OTP, THE Auth_System SHALL create an authenticated session using cookie-based auth
5. WHEN an authenticated user has not completed onboarding, THE System SHALL redirect the user to the onboarding page

### Requirement 2: Profile Onboarding

**User Story:** As a newly authenticated student, I want to set up my profile with my name, year, program, and courses, so that the system can match me with relevant study groups.

#### Acceptance Criteria

1. WHEN a student completes the onboarding form with display name, year, program, and at least one course, THE System SHALL create a profile record and set onboarded to true
2. WHEN a student selects courses during onboarding, THE System SHALL create enrollment records linking the student to those courses
3. WHILE a student has onboarded set to false, THE System SHALL prevent access to protected features except the onboarding page

### Requirement 3: Subject and Course Browsing

**User Story:** As a visitor or student, I want to browse subjects and courses, so that I can discover available study groups and sessions.

#### Acceptance Criteria

1. THE System SHALL display a grid of subject cards on the subjects page showing name, session counts, and attendee counts
2. WHEN a visitor views the subjects page, THE System SHALL show all subjects without requiring authentication
3. WHEN an authenticated student views the subjects page, THE System SHALL pin the student's enrolled subjects to the top
4. WHEN a user navigates to a subject detail page, THE System SHALL display today's sessions and a 7-day session strip with room information
5. WHILE a user is unauthenticated, THE System SHALL hide attendee names and prevent joining or RSVP actions

### Requirement 4: Note Upload and Topic Extraction

**User Story:** As a student, I want to upload my course notes, so that the system can identify my topic strengths and weaknesses.

#### Acceptance Criteria

1. WHEN a student uploads or pastes note text and selects a course, THE System SHALL store the note and invoke the AI topic extraction pipeline
2. WHEN the AI_Pipeline processes note text, THE System SHALL return a validated list of topics with confidence levels (1-5) and status (learning/reviewing/stuck)
3. WHEN the AI_Pipeline returns a valid extraction result, THE System SHALL upsert the student's topic_profile for that course
4. IF the AI_Pipeline returns malformed JSON on the first attempt, THEN THE System SHALL retry the extraction call exactly once
5. IF the AI_Pipeline fails after retry, THEN THE System SHALL display an error toast and preserve the uploaded note for later reprocessing
6. THE System SHALL complete topic extraction within 10 seconds of submission

### Requirement 5: Group Matching Algorithm

**User Story:** As a student, I want to be matched into a study group where members have complementary strengths, so that we can help each other with our weak topics.

#### Acceptance Criteria

1. WHEN matching is triggered for a course, THE Matcher SHALL retrieve all topic_profiles for that course and form groups of 4-6 students
2. THE Matcher SHALL maximize the complementarity score defined as the sum of per-topic confidence spread (max - min) across group members
3. THE Matcher SHALL penalize groups where pace differences exceed one step (e.g., behind matched with ahead)
4. WHEN fewer than 4 students have topic_profiles for a course, THE Matcher SHALL not form any group and return an empty result
5. WHEN leftover students remain after group formation, THE Matcher SHALL assign each leftover to the highest-scoring group that has not exceeded 6 members
6. WHEN groups are formed, THE AI_Pipeline SHALL generate a 2-3 word name and one-sentence rationale for each group
7. THE Matcher SHALL ensure every input student appears in exactly one output group with no duplicates or omissions

### Requirement 6: Timeline Generation

**User Story:** As a study group member, I want an AI-generated study schedule, so that my group has organized sessions targeting our weak topics.

#### Acceptance Criteria

1. WHEN timeline generation is triggered for a group, THE AI_Pipeline SHALL produce exactly 6 study sessions
2. THE AI_Pipeline SHALL schedule all sessions on weekdays only (Monday through Friday)
3. THE AI_Pipeline SHALL schedule sessions with start times between 09:00 and 20:00, each lasting exactly 90 minutes
4. THE AI_Pipeline SHALL order session topics from weakest group topics first to strongest last
5. THE System SHALL assign rooms to sessions using round-robin allocation from available campus rooms
6. WHEN a timeline is generated, THE System SHALL assign each session a unique 4-digit numeric check-in code

### Requirement 7: RSVP and Attendance

**User Story:** As a group member, I want to RSVP to sessions and check in with a code, so that my attendance is tracked and group members can see who's coming.

#### Acceptance Criteria

1. WHEN a student RSVPs to a session, THE System SHALL create an attendance record with status 'rsvp' and the current timestamp
2. WHEN a student enters the correct 4-digit check-in code for a session, THE System SHALL update their attendance status to 'checked_in'
3. IF a student enters an incorrect check-in code, THEN THE System SHALL reject the check-in and display a validation error
4. THE System SHALL enforce uniqueness of attendance records per session-user combination
5. WHEN an attendance record is created or updated, THE Realtime_System SHALL broadcast the change to all subscribed clients within 2 seconds
6. WHEN a student in another browser is subscribed to a session's attendance, THE Realtime_System SHALL update the attendee count without requiring a page refresh

### Requirement 8: Real-Time Updates

**User Story:** As a student viewing a session page, I want to see live updates when others RSVP or check in, so that I have current information about attendance.

#### Acceptance Criteria

1. WHEN a client subscribes to a session's attendance channel, THE Realtime_System SHALL deliver all subsequent attendance changes for that session
2. WHEN a realtime connection is lost, THE System SHALL automatically reconnect and refetch current attendance state
3. WHILE a client is subscribed to attendance updates, THE System SHALL display the current RSVP count and checked-in count in real time

### Requirement 9: Access Control and RLS

**User Story:** As a system administrator, I want database-level access control, so that data is protected regardless of client-side code.

#### Acceptance Criteria

1. THE System SHALL enable Row Level Security on every database table
2. WHILE a user is unauthenticated, THE System SHALL allow read-only access to subjects, courses, and session schedule data only
3. WHILE a user is authenticated, THE System SHALL allow the user to read and write only their own profile, enrollments, note_uploads, and attendance records
4. THE System SHALL prevent authenticated users from accessing other users' note upload content
5. THE System SHALL restrict study group and session write operations to server-side service role only

### Requirement 10: Security and Environment

**User Story:** As a developer, I want secrets properly isolated, so that API keys are never exposed to the client.

#### Acceptance Criteria

1. THE System SHALL never include SUPABASE_SERVICE_ROLE_KEY or ANTHROPIC_API_KEY in the client JavaScript bundle
2. THE System SHALL execute all Anthropic API calls exclusively in server-side code (Server Actions or Route Handlers)
3. THE System SHALL validate all AI responses with Zod schemas before writing to the database
4. THE System SHALL provide an .env.example file listing all required environment variables without actual values

### Requirement 11: Seed Data and Development

**User Story:** As a developer, I want realistic seed data, so that I can develop and test the application with representative content.

#### Acceptance Criteria

1. WHEN `npm run seed` is executed, THE System SHALL populate the database with 8 subjects, 3 courses each, 10 rooms, and 40 fake students
2. WHEN seed runs on a fresh database, THE System SHALL succeed without errors
3. WHEN seed runs on an already-seeded database, THE System SHALL be idempotent and not produce duplicate records
4. THE System SHALL include realistic note text for at least 24 students across 6 courses
5. THE System SHALL seed sessions across today and the next 5 days, with several sessions scheduled for today
6. THE System SHALL pre-populate RSVPs with 3-6 attendees per session

### Requirement 12: Build Quality

**User Story:** As a developer, I want zero TypeScript errors and passing tests, so that the codebase is reliable and deployable.

#### Acceptance Criteria

1. WHEN `npm run build` is executed, THE System SHALL complete with zero TypeScript errors
2. WHEN `npm test` is executed, THE System SHALL pass all tests including complementarity scoring unit tests
3. THE System SHALL render every page correctly at 390px viewport width (mobile)
4. THE System SHALL provide loading states, empty states, and error toasts on all interactive pages
