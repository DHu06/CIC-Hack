-- StudyHall UBC: Initial Database Schema
-- This migration creates all application tables, enables RLS, adds indexes and unique constraints.

-- ============================================================================
-- TABLES
-- ============================================================================

-- profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  display_name text NOT NULL,
  year int,
  program text,
  avatar_url text,
  onboarded boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- subjects
CREATE TABLE subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  colour text NOT NULL,
  icon text
);

-- courses
CREATE TABLE courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES subjects ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  term text NOT NULL DEFAULT '2026W1',
  UNIQUE (subject_id, code, term)
);

-- enrollments
CREATE TABLE enrollments (
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses ON DELETE CASCADE,
  PRIMARY KEY (user_id, course_id)
);

-- note_uploads
CREATE TABLE note_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses ON DELETE CASCADE,
  raw_text text NOT NULL,
  filename text,
  created_at timestamptz DEFAULT now()
);

-- topic_profiles
CREATE TABLE topic_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses ON DELETE CASCADE,
  topics jsonb NOT NULL,
  overall_pace text NOT NULL,
  summary text,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- study_groups
CREATE TABLE study_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses ON DELETE CASCADE,
  name text NOT NULL,
  rationale text,
  created_at timestamptz DEFAULT now()
);

-- group_members
CREATE TABLE group_members (
  group_id uuid NOT NULL REFERENCES study_groups ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  PRIMARY KEY (group_id, user_id)
);

-- rooms
CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  building text NOT NULL,
  floor text,
  capacity int NOT NULL,
  map_url text
);

-- sessions
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES study_groups ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  topic text NOT NULL,
  goal text,
  status text DEFAULT 'scheduled',
  checkin_code char(4) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- attendance
CREATE TABLE attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  status text DEFAULT 'rsvp',
  rsvp_at timestamptz,
  checked_in_at timestamptz,
  UNIQUE (session_id, user_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_sessions_date ON sessions (date);
CREATE INDEX idx_sessions_group_id ON sessions (group_id);
CREATE INDEX idx_attendance_session_id ON attendance (session_id);
CREATE INDEX idx_enrollments_user_id ON enrollments (user_id);
