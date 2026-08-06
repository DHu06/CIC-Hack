-- StudyHall UBC: Demo Simulation Data
-- Adds 20 students, enrollments, study groups, sessions for today, and attendance

-- ============================================================================
-- PROFILES (20 fake UBC students)
-- ============================================================================

INSERT INTO profiles (id, email, display_name, year, program, onboarded) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'alex.chen@student.ubc.ca', 'Alex Chen', 3, 'Computer Science', true),
  ('d1000000-0000-0000-0000-000000000002', 'sarah.kim@student.ubc.ca', 'Sarah Kim', 2, 'Mathematics', true),
  ('d1000000-0000-0000-0000-000000000003', 'james.liu@student.ubc.ca', 'James Liu', 4, 'Computer Science', true),
  ('d1000000-0000-0000-0000-000000000004', 'emma.wilson@student.ubc.ca', 'Emma Wilson', 2, 'Physics', true),
  ('d1000000-0000-0000-0000-000000000005', 'ryan.patel@student.ubc.ca', 'Ryan Patel', 3, 'Statistics', true),
  ('d1000000-0000-0000-0000-000000000006', 'mia.zhang@student.ubc.ca', 'Mia Zhang', 1, 'Biology', true),
  ('d1000000-0000-0000-0000-000000000007', 'noah.singh@student.ubc.ca', 'Noah Singh', 3, 'Economics', true),
  ('d1000000-0000-0000-0000-000000000008', 'olivia.lee@student.ubc.ca', 'Olivia Lee', 2, 'Chemistry', true),
  ('d1000000-0000-0000-0000-000000000009', 'ethan.wang@student.ubc.ca', 'Ethan Wang', 4, 'Computer Science', true),
  ('d1000000-0000-0000-0000-000000000010', 'sophia.nguyen@student.ubc.ca', 'Sophia Nguyen', 2, 'Psychology', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, display_name, year, program, onboarded) VALUES
  ('d1000000-0000-0000-0000-000000000011', 'liam.thompson@student.ubc.ca', 'Liam Thompson', 1, 'Computer Science', true),
  ('d1000000-0000-0000-0000-000000000012', 'ava.martinez@student.ubc.ca', 'Ava Martinez', 3, 'Mathematics', true),
  ('d1000000-0000-0000-0000-000000000013', 'lucas.brown@student.ubc.ca', 'Lucas Brown', 2, 'Physics', true),
  ('d1000000-0000-0000-0000-000000000014', 'isabella.garcia@student.ubc.ca', 'Isabella Garcia', 4, 'Chemistry', true),
  ('d1000000-0000-0000-0000-000000000015', 'mason.taylor@student.ubc.ca', 'Mason Taylor', 3, 'Statistics', true),
  ('d1000000-0000-0000-0000-000000000016', 'charlotte.anderson@student.ubc.ca', 'Charlotte Anderson', 2, 'Biology', true),
  ('d1000000-0000-0000-0000-000000000017', 'logan.white@student.ubc.ca', 'Logan White', 1, 'Economics', true),
  ('d1000000-0000-0000-0000-000000000018', 'harper.jackson@student.ubc.ca', 'Harper Jackson', 3, 'Psychology', true),
  ('d1000000-0000-0000-0000-000000000019', 'aiden.harris@student.ubc.ca', 'Aiden Harris', 2, 'Computer Science', true),
  ('d1000000-0000-0000-0000-000000000020', 'ella.clark@student.ubc.ca', 'Ella Clark', 4, 'Mathematics', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ENROLLMENTS (students enrolled in courses)
-- ============================================================================

INSERT INTO enrollments (user_id, course_id) VALUES
  -- Alex Chen: CPSC 221, MATH 200, STAT 200
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004'),
  ('d1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000016'),
  -- Sarah Kim: MATH 200, MATH 221, STAT 302
  ('d1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004'),
  ('d1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000005'),
  ('d1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000017'),
  -- James Liu: CPSC 313, CPSC 221, MATH 302
  ('d1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003'),
  ('d1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000006'),
  -- Emma Wilson: PHYS 118, MATH 200, CHEM 121
  ('d1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000007'),
  ('d1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004'),
  ('d1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000010'),
  -- Ryan Patel: STAT 200, STAT 302, ECON 101
  ('d1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000016'),
  ('d1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000017'),
  ('d1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000019'),
  -- Mia Zhang: BIOL 112, CHEM 121, PHYS 118
  ('d1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000013'),
  ('d1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000010'),
  ('d1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000007'),
  -- Noah Singh: ECON 101, ECON 301, STAT 200
  ('d1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000019'),
  ('d1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000020'),
  ('d1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000016'),
  -- Olivia Lee: CHEM 121, CHEM 233, BIOL 112
  ('d1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000010'),
  ('d1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000011'),
  ('d1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000013')
ON CONFLICT DO NOTHING;

INSERT INTO enrollments (user_id, course_id) VALUES
  -- Ethan Wang: CPSC 313, CPSC 221, CPSC 110
  ('d1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000003'),
  ('d1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000001'),
  -- Sophia Nguyen: PSYC 101, PSYC 217, STAT 200
  ('d1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000022'),
  ('d1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000023'),
  ('d1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000016'),
  -- Liam Thompson: CPSC 110, MATH 200, PHYS 118
  ('d1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000004'),
  ('d1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000007'),
  -- Ava Martinez: MATH 221, MATH 302, CPSC 221
  ('d1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000005'),
  ('d1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000006'),
  ('d1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000002'),
  -- Lucas Brown: PHYS 210, PHYS 118, MATH 221
  ('d1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000008'),
  ('d1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000007'),
  ('d1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000005'),
  -- Isabella Garcia: CHEM 233, CHEM 301, BIOL 200
  ('d1000000-0000-0000-0000-000000000014', 'b1000000-0000-0000-0000-000000000011'),
  ('d1000000-0000-0000-0000-000000000014', 'b1000000-0000-0000-0000-000000000012'),
  ('d1000000-0000-0000-0000-000000000014', 'b1000000-0000-0000-0000-000000000014'),
  -- Mason Taylor: STAT 302, STAT 404, MATH 302
  ('d1000000-0000-0000-0000-000000000015', 'b1000000-0000-0000-0000-000000000017'),
  ('d1000000-0000-0000-0000-000000000015', 'b1000000-0000-0000-0000-000000000018'),
  ('d1000000-0000-0000-0000-000000000015', 'b1000000-0000-0000-0000-000000000006'),
  -- Charlotte Anderson: BIOL 200, BIOL 300, CHEM 233
  ('d1000000-0000-0000-0000-000000000016', 'b1000000-0000-0000-0000-000000000014'),
  ('d1000000-0000-0000-0000-000000000016', 'b1000000-0000-0000-0000-000000000015'),
  ('d1000000-0000-0000-0000-000000000016', 'b1000000-0000-0000-0000-000000000011'),
  -- Logan White: ECON 101, ECON 325, PSYC 101
  ('d1000000-0000-0000-0000-000000000017', 'b1000000-0000-0000-0000-000000000019'),
  ('d1000000-0000-0000-0000-000000000017', 'b1000000-0000-0000-0000-000000000021'),
  ('d1000000-0000-0000-0000-000000000017', 'b1000000-0000-0000-0000-000000000022'),
  -- Harper Jackson: PSYC 217, PSYC 304, BIOL 112
  ('d1000000-0000-0000-0000-000000000018', 'b1000000-0000-0000-0000-000000000023'),
  ('d1000000-0000-0000-0000-000000000018', 'b1000000-0000-0000-0000-000000000024'),
  ('d1000000-0000-0000-0000-000000000018', 'b1000000-0000-0000-0000-000000000013'),
  -- Aiden Harris: CPSC 110, CPSC 221, STAT 200
  ('d1000000-0000-0000-0000-000000000019', 'b1000000-0000-0000-0000-000000000001'),
  ('d1000000-0000-0000-0000-000000000019', 'b1000000-0000-0000-0000-000000000002'),
  ('d1000000-0000-0000-0000-000000000019', 'b1000000-0000-0000-0000-000000000016'),
  -- Ella Clark: MATH 302, MATH 221, STAT 404
  ('d1000000-0000-0000-0000-000000000020', 'b1000000-0000-0000-0000-000000000006'),
  ('d1000000-0000-0000-0000-000000000020', 'b1000000-0000-0000-0000-000000000005'),
  ('d1000000-0000-0000-0000-000000000020', 'b1000000-0000-0000-0000-000000000018')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STUDY GROUPS (6 groups across different courses)
-- ============================================================================

INSERT INTO study_groups (id, course_id, name, rationale, created_at) VALUES
  ('e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 'Algo Aces', 'Complementary skills: Alex strong in recursion, James in graph theory, Ava in dynamic programming', now()),
  ('e1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', 'Calculus Crew', 'Mixed pace: Sarah ahead on integration, Emma catching up on multivariable, Liam strong in applications', now()),
  ('e1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000010', 'Molecule Makers', 'Complementary: Olivia strong in organic, Mia in bonding, Emma in thermodynamics', now()),
  ('e1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000016', 'Stats Squad', 'Mixed backgrounds: Ryan from econ, Sophia from psych, Alex from CS — different applications', now()),
  ('e1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000019', 'Econ Explorers', 'Ryan quantitative, Noah theoretical, Logan policy-focused — covers all angles', now()),
  ('e1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000001', 'Code Newbies', 'First-year support: Liam and Aiden helping each other with Racket/Python basics', now())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- GROUP MEMBERS
-- ============================================================================

INSERT INTO group_members (group_id, user_id) VALUES
  -- Algo Aces: Alex, James, Ava, Aiden
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001'),
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003'),
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000012'),
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000019'),
  -- Calculus Crew: Sarah, Emma, Liam
  ('e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002'),
  ('e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000004'),
  ('e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000011'),
  -- Molecule Makers: Olivia, Mia, Emma
  ('e1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000008'),
  ('e1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000006'),
  ('e1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000004'),
  -- Stats Squad: Ryan, Sophia, Alex, Noah
  ('e1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000005'),
  ('e1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000010'),
  ('e1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001'),
  ('e1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000007'),
  -- Econ Explorers: Ryan, Noah, Logan
  ('e1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000005'),
  ('e1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000007'),
  ('e1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000017'),
  -- Code Newbies: Liam, Aiden, Ethan
  ('e1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000011'),
  ('e1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000019'),
  ('e1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000009')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SESSIONS (8 sessions happening today across subjects)
-- ============================================================================

INSERT INTO sessions (id, group_id, room_id, subject_id, date, start_time, end_time, topic, goal, status, checkin_code) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001',
   CURRENT_DATE, '10:00', '11:30', 'Binary Search Trees & AVL Rotations', 'Master BST operations and balancing', 'scheduled', '4821'),
  ('f1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002',
   CURRENT_DATE, '11:00', '12:30', 'Double Integrals & Change of Variables', 'Practice Jacobian transformations', 'scheduled', '7293'),
  ('f1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000004',
   CURRENT_DATE, '13:00', '14:30', 'Lewis Structures & VSEPR Theory', 'Predict molecular geometry from Lewis structures', 'scheduled', '1056'),
  ('f1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006',
   CURRENT_DATE, '14:00', '15:30', 'Hypothesis Testing & P-values', 'Work through t-test and chi-square problems', 'scheduled', '3847'),
  ('f1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000007',
   CURRENT_DATE, '15:00', '16:30', 'Supply & Demand Equilibrium', 'Solve equilibrium problems with tax/subsidy', 'scheduled', '9164'),
  ('f1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001',
   CURRENT_DATE, '16:00', '17:30', 'Recursion & Helper Functions', 'Write recursive solutions for list problems', 'scheduled', '5738'),
  ('f1000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001',
   CURRENT_DATE + 1, '10:00', '11:30', 'Graph BFS & DFS', 'Implement traversals and detect cycles', 'scheduled', '2491'),
  ('f1000000-0000-0000-0000-000000000008', 'e1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000006',
   CURRENT_DATE + 1, '13:00', '14:30', 'Confidence Intervals', 'Build CIs for means and proportions', 'scheduled', '6025')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ATTENDANCE (RSVPs and check-ins for today's sessions)
-- ============================================================================

INSERT INTO attendance (id, session_id, user_id, status, rsvp_at, checked_in_at) VALUES
  -- Session 1 (BST): all 4 Algo Aces RSVPd, 3 checked in
  ('a2000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'checked_in', now() - interval '2 hours', now() - interval '30 minutes'),
  ('a2000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'checked_in', now() - interval '3 hours', now() - interval '28 minutes'),
  ('a2000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000012', 'checked_in', now() - interval '1 hour', now() - interval '25 minutes'),
  ('a2000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000019', 'rsvp', now() - interval '4 hours', NULL),
  -- Session 2 (Calculus): all 3 RSVPd, 2 checked in
  ('a2000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 'checked_in', now() - interval '5 hours', now() - interval '1 hour'),
  ('a2000000-0000-0000-0000-000000000006', 'f1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000004', 'checked_in', now() - interval '4 hours', now() - interval '55 minutes'),
  ('a2000000-0000-0000-0000-000000000007', 'f1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000011', 'rsvp', now() - interval '6 hours', NULL),
  -- Session 3 (Chemistry): all 3 RSVPd
  ('a2000000-0000-0000-0000-000000000008', 'f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000008', 'rsvp', now() - interval '3 hours', NULL),
  ('a2000000-0000-0000-0000-000000000009', 'f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000006', 'rsvp', now() - interval '2 hours', NULL),
  ('a2000000-0000-0000-0000-000000000010', 'f1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000004', 'rsvp', now() - interval '4 hours', NULL),
  -- Session 4 (Stats): all 4 RSVPd, 2 checked in
  ('a2000000-0000-0000-0000-000000000011', 'f1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000005', 'checked_in', now() - interval '3 hours', now() - interval '20 minutes'),
  ('a2000000-0000-0000-0000-000000000012', 'f1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000010', 'checked_in', now() - interval '2 hours', now() - interval '18 minutes'),
  ('a2000000-0000-0000-0000-000000000013', 'f1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000001', 'rsvp', now() - interval '5 hours', NULL),
  ('a2000000-0000-0000-0000-000000000014', 'f1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000007', 'rsvp', now() - interval '4 hours', NULL),
  -- Session 5 (Econ): all 3 RSVPd
  ('a2000000-0000-0000-0000-000000000015', 'f1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000005', 'rsvp', now() - interval '6 hours', NULL),
  ('a2000000-0000-0000-0000-000000000016', 'f1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000007', 'rsvp', now() - interval '5 hours', NULL),
  ('a2000000-0000-0000-0000-000000000017', 'f1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000017', 'rsvp', now() - interval '4 hours', NULL),
  -- Session 6 (CPSC 110): all 3 RSVPd
  ('a2000000-0000-0000-0000-000000000018', 'f1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000011', 'rsvp', now() - interval '3 hours', NULL),
  ('a2000000-0000-0000-0000-000000000019', 'f1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000019', 'rsvp', now() - interval '2 hours', NULL),
  ('a2000000-0000-0000-0000-000000000020', 'f1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000009', 'rsvp', now() - interval '1 hour', NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- NOTE UPLOADS (a few students have uploaded notes)
-- ============================================================================

INSERT INTO note_uploads (id, user_id, course_id, raw_text, filename, created_at) VALUES
  ('aa000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002',
   'Binary search trees maintain sorted order. Insert: compare with root, go left if smaller, right if larger. AVL trees self-balance using rotations when height difference > 1. Left rotation, right rotation, left-right, right-left cases.',
   'cpsc221-bst-notes.txt', now() - interval '2 days'),
  ('aa000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002',
   'Graph algorithms: BFS uses queue for level-order traversal. DFS uses stack (or recursion). Time complexity O(V+E). Applications: shortest path (unweighted), cycle detection, topological sort.',
   'cpsc221-graphs.txt', now() - interval '1 day'),
  ('aa000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004',
   'Double integrals: integrate inner variable first. Change of variables requires Jacobian determinant. Polar coordinates: x=rcosθ, y=rsinθ, dA=r dr dθ. Useful for circular regions.',
   'math200-double-integrals.txt', now() - interval '3 days'),
  ('aa000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000016',
   'Hypothesis testing steps: 1) State H0 and Ha, 2) Choose significance level α, 3) Calculate test statistic, 4) Find p-value, 5) Compare p-value to α, 6) Conclude. Type I error = reject true H0. Type II = fail to reject false H0.',
   'stat200-hypothesis-testing.txt', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TOPIC PROFILES (AI-generated learning profiles for demo students)
-- ============================================================================

INSERT INTO topic_profiles (id, user_id, course_id, topics, overall_pace, summary) VALUES
  ('bb000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002',
   '{"strong": ["recursion", "linked lists"], "weak": ["graph algorithms", "AVL rotations"], "current": "binary search trees"}',
   'on-track', 'Alex has solid fundamentals in recursion and linked lists. Needs more practice with tree balancing and graph traversals.'),
  ('bb000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002',
   '{"strong": ["graph theory", "BFS/DFS"], "weak": ["dynamic programming", "amortized analysis"], "current": "graph algorithms"}',
   'ahead', 'James excels at graph problems and traversals. Could benefit from DP practice and complexity analysis.'),
  ('bb000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004',
   '{"strong": ["integration techniques", "series"], "weak": ["multivariable chain rule", "surface integrals"], "current": "double integrals"}',
   'on-track', 'Sarah is strong in single-variable calculus. Working through multivariable concepts methodically.'),
  ('bb000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000016',
   '{"strong": ["probability distributions", "expected value"], "weak": ["regression", "ANOVA"], "current": "hypothesis testing"}',
   'on-track', 'Ryan has a quantitative background from econ. Good with probability, building intuition for inference.')
ON CONFLICT (user_id, course_id) DO NOTHING;
