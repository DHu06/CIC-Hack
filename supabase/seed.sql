-- StudyHall UBC: Static Reference Data Seed
-- This file is idempotent — safe to run multiple times.

-- ============================================================================
-- SUBJECTS (8 subjects with fixed UUIDs)
-- ============================================================================

INSERT INTO subjects (id, code, name, colour) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'CPSC', 'Computer Science', '#3B82F6'),
  ('a1000000-0000-0000-0000-000000000002', 'MATH', 'Mathematics', '#8B5CF6'),
  ('a1000000-0000-0000-0000-000000000003', 'PHYS', 'Physics', '#EF4444'),
  ('a1000000-0000-0000-0000-000000000004', 'CHEM', 'Chemistry', '#10B981'),
  ('a1000000-0000-0000-0000-000000000005', 'BIOL', 'Biology', '#F59E0B'),
  ('a1000000-0000-0000-0000-000000000006', 'STAT', 'Statistics', '#06B6D4'),
  ('a1000000-0000-0000-0000-000000000007', 'ECON', 'Economics', '#F97316'),
  ('a1000000-0000-0000-0000-000000000008', 'PSYC', 'Psychology', '#EC4899')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COURSES (3 per subject = 24 total, fixed UUIDs)
-- ============================================================================

-- CPSC courses
INSERT INTO courses (id, subject_id, code, title, term) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'CPSC 110', 'Computation, Programs, and Programming', '2026W1'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'CPSC 221', 'Basic Algorithms and Data Structures', '2026W1'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'CPSC 313', 'Computer Hardware and Operating Systems', '2026W1')
ON CONFLICT (subject_id, code, term) DO NOTHING;

-- MATH courses
INSERT INTO courses (id, subject_id, code, title, term) VALUES
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'MATH 200', 'Calculus III', '2026W1'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 'MATH 221', 'Matrix Algebra', '2026W1'),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'MATH 302', 'Introduction to Probability', '2026W1')
ON CONFLICT (subject_id, code, term) DO NOTHING;

-- PHYS courses
INSERT INTO courses (id, subject_id, code, title, term) VALUES
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003', 'PHYS 118', 'Electricity, Light and Radiation', '2026W1'),
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000003', 'PHYS 210', 'Introduction to Computational Physics', '2026W1'),
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000003', 'PHYS 301', 'Electricity and Magnetism', '2026W1')
ON CONFLICT (subject_id, code, term) DO NOTHING;

-- CHEM courses
INSERT INTO courses (id, subject_id, code, title, term) VALUES
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000004', 'CHEM 121', 'Structural Chemistry', '2026W1'),
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000004', 'CHEM 233', 'Organic Chemistry', '2026W1'),
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000004', 'CHEM 301', 'Aqueous Environmental Chemistry', '2026W1')
ON CONFLICT (subject_id, code, term) DO NOTHING;

-- BIOL courses
INSERT INTO courses (id, subject_id, code, title, term) VALUES
  ('b1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000005', 'BIOL 112', 'Cell Biology', '2026W1'),
  ('b1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000005', 'BIOL 200', 'Fundamentals of Cell Biology', '2026W1'),
  ('b1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000005', 'BIOL 300', 'Foundations of Genetics', '2026W1')
ON CONFLICT (subject_id, code, term) DO NOTHING;

-- STAT courses
INSERT INTO courses (id, subject_id, code, title, term) VALUES
  ('b1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000006', 'STAT 200', 'Elementary Statistics for Applications', '2026W1'),
  ('b1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000006', 'STAT 302', 'Introduction to Probability', '2026W1'),
  ('b1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000006', 'STAT 404', 'Design and Analysis of Experiments', '2026W1')
ON CONFLICT (subject_id, code, term) DO NOTHING;

-- ECON courses
INSERT INTO courses (id, subject_id, code, title, term) VALUES
  ('b1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000007', 'ECON 101', 'Principles of Microeconomics', '2026W1'),
  ('b1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000007', 'ECON 301', 'Intermediate Microeconomics', '2026W1'),
  ('b1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000007', 'ECON 325', 'Introduction to Empirical Economics', '2026W1')
ON CONFLICT (subject_id, code, term) DO NOTHING;

-- PSYC courses
INSERT INTO courses (id, subject_id, code, title, term) VALUES
  ('b1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000008', 'PSYC 101', 'Introduction to Biological and Cognitive Psychology', '2026W1'),
  ('b1000000-0000-0000-0000-000000000023', 'a1000000-0000-0000-0000-000000000008', 'PSYC 217', 'Research Methods', '2026W1'),
  ('b1000000-0000-0000-0000-000000000024', 'a1000000-0000-0000-0000-000000000008', 'PSYC 304', 'Brain and Behaviour', '2026W1')
ON CONFLICT (subject_id, code, term) DO NOTHING;

-- ============================================================================
-- ROOMS (10 UBC campus rooms with fixed UUIDs)
-- ============================================================================

INSERT INTO rooms (id, name, building, floor, capacity, map_url) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Room 182', 'Irving K. Barber Learning Centre', '1', 20, 'https://maps.ubc.ca/?code=IKBLC'),
  ('c1000000-0000-0000-0000-000000000002', 'Room 261', 'Irving K. Barber Learning Centre', '2', 12, 'https://maps.ubc.ca/?code=IKBLC'),
  ('c1000000-0000-0000-0000-000000000003', 'Room 216', 'Koerner Library', '2', 16, 'https://maps.ubc.ca/?code=KOEL'),
  ('c1000000-0000-0000-0000-000000000004', 'Room 302', 'Koerner Library', '3', 10, 'https://maps.ubc.ca/?code=KOEL'),
  ('c1000000-0000-0000-0000-000000000005', 'Room 4', 'Woodward Library', 'B', 8, 'https://maps.ubc.ca/?code=WOOD'),
  ('c1000000-0000-0000-0000-000000000006', 'Room 8', 'Woodward Library', 'B', 10, 'https://maps.ubc.ca/?code=WOOD'),
  ('c1000000-0000-0000-0000-000000000007', 'Room 246', 'ICICS', '2', 30, 'https://maps.ubc.ca/?code=ICCS'),
  ('c1000000-0000-0000-0000-000000000008', 'Room X150', 'ICICS', '1', 25, 'https://maps.ubc.ca/?code=ICCS'),
  ('c1000000-0000-0000-0000-000000000009', 'Room 2306', 'The Nest (AMS Student Union Building)', '2', 14, 'https://maps.ubc.ca/?code=NEST'),
  ('c1000000-0000-0000-0000-000000000010', 'Room 3301', 'The Nest (AMS Student Union Building)', '3', 18, 'https://maps.ubc.ca/?code=NEST')
ON CONFLICT (id) DO NOTHING;
