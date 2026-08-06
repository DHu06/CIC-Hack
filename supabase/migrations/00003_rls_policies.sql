-- StudyHall UBC: Row Level Security Policies
-- RLS is already enabled on all tables (00001_initial_schema.sql).
-- This migration creates the actual policies.
--
-- Conventions:
--   • "anyone can read" uses roles anon + authenticated with USING (true)
--   • "authenticated can read" checks auth.role() = 'authenticated'
--   • "write own" checks auth.uid() = user_id
--   • Service role bypasses RLS automatically — no explicit policies needed for AI pipeline writes

-- ============================================================================
-- PROFILES
-- ============================================================================
-- Authenticated users can read all profiles (needed for group member display)
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can only insert their own profile
CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- SUBJECTS
-- ============================================================================
-- Anyone (including anon visitors) can read subjects
CREATE POLICY "subjects_select" ON subjects
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- No public write — service role only

-- ============================================================================
-- COURSES
-- ============================================================================
-- Anyone (including anon visitors) can read courses
CREATE POLICY "courses_select" ON courses
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- No public write — service role only

-- ============================================================================
-- ROOMS
-- ============================================================================
-- Anyone (including anon visitors) can read rooms
CREATE POLICY "rooms_select" ON rooms
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- No public write — service role only

-- ============================================================================
-- ENROLLMENTS
-- ============================================================================
-- Users can read their own enrollments
CREATE POLICY "enrollments_select" ON enrollments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own enrollments
CREATE POLICY "enrollments_insert" ON enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own enrollments
CREATE POLICY "enrollments_delete" ON enrollments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- NOTE_UPLOADS
-- ============================================================================
-- Users can only read their own notes (no access to others' notes)
CREATE POLICY "note_uploads_select" ON note_uploads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only insert their own notes
CREATE POLICY "note_uploads_insert" ON note_uploads
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own notes
CREATE POLICY "note_uploads_update" ON note_uploads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own notes
CREATE POLICY "note_uploads_delete" ON note_uploads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- TOPIC_PROFILES
-- ============================================================================
-- Users can read their own topic profiles (and others in their group for display)
-- For simplicity, allow authenticated users to read all topic profiles
-- (needed when viewing group member strengths/weaknesses)
CREATE POLICY "topic_profiles_select" ON topic_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own topic profiles
CREATE POLICY "topic_profiles_insert" ON topic_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own topic profiles
CREATE POLICY "topic_profiles_update" ON topic_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- STUDY_GROUPS
-- ============================================================================
-- Authenticated users can read all study groups (needed for browsing)
CREATE POLICY "study_groups_select" ON study_groups
  FOR SELECT
  TO authenticated
  USING (true);

-- No public write — service role only (AI pipeline creates groups)

-- ============================================================================
-- GROUP_MEMBERS
-- ============================================================================
-- Authenticated users can read all group memberships (needed for group display)
CREATE POLICY "group_members_select" ON group_members
  FOR SELECT
  TO authenticated
  USING (true);

-- No public write — service role only (AI pipeline assigns members)

-- ============================================================================
-- SESSIONS
-- ============================================================================
-- Anyone (including anon visitors) can read session schedule data
CREATE POLICY "sessions_select" ON sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- No public write — service role only (AI pipeline creates sessions)

-- ============================================================================
-- ATTENDANCE
-- ============================================================================
-- Authenticated users can read attendance for any session (needed for realtime counts)
CREATE POLICY "attendance_select" ON attendance
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can only insert their own attendance records (RSVP)
CREATE POLICY "attendance_insert" ON attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own attendance records (check-in)
CREATE POLICY "attendance_update" ON attendance
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
