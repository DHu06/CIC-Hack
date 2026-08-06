/**
 * StudyHall UBC Seed Script
 *
 * Creates 40 fake students, enrollments, note_uploads, topic_profiles,
 * study_groups, sessions, and attendance records.
 *
 * Usage: npm run seed
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

dotenv.config({ path: join(__dirname, "..", ".env.local") });

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ============================================================================
// CONSTANTS
// ============================================================================

const COURSE_IDS: Record<string, string> = {
  "CPSC 110": "b1000000-0000-0000-0000-000000000001",
  "CPSC 221": "b1000000-0000-0000-0000-000000000002",
  "CPSC 313": "b1000000-0000-0000-0000-000000000003",
  "MATH 200": "b1000000-0000-0000-0000-000000000004",
  "MATH 221": "b1000000-0000-0000-0000-000000000005",
  "MATH 302": "b1000000-0000-0000-0000-000000000006",
  "PHYS 118": "b1000000-0000-0000-0000-000000000007",
  "PHYS 210": "b1000000-0000-0000-0000-000000000008",
  "PHYS 301": "b1000000-0000-0000-0000-000000000009",
  "CHEM 121": "b1000000-0000-0000-0000-000000000010",
  "CHEM 233": "b1000000-0000-0000-0000-000000000011",
  "CHEM 301": "b1000000-0000-0000-0000-000000000012",
  "BIOL 112": "b1000000-0000-0000-0000-000000000013",
  "BIOL 200": "b1000000-0000-0000-0000-000000000014",
  "BIOL 300": "b1000000-0000-0000-0000-000000000015",
  "STAT 200": "b1000000-0000-0000-0000-000000000016",
  "STAT 302": "b1000000-0000-0000-0000-000000000017",
  "STAT 404": "b1000000-0000-0000-0000-000000000018",
  "ECON 101": "b1000000-0000-0000-0000-000000000019",
  "ECON 301": "b1000000-0000-0000-0000-000000000020",
  "ECON 325": "b1000000-0000-0000-0000-000000000021",
  "PSYC 101": "b1000000-0000-0000-0000-000000000022",
  "PSYC 217": "b1000000-0000-0000-0000-000000000023",
  "PSYC 304": "b1000000-0000-0000-0000-000000000024",
};

const SUBJECT_IDS: Record<string, string> = {
  CPSC: "a1000000-0000-0000-0000-000000000001",
  MATH: "a1000000-0000-0000-0000-000000000002",
  PHYS: "a1000000-0000-0000-0000-000000000003",
  CHEM: "a1000000-0000-0000-0000-000000000004",
  BIOL: "a1000000-0000-0000-0000-000000000005",
  STAT: "a1000000-0000-0000-0000-000000000006",
  ECON: "a1000000-0000-0000-0000-000000000007",
  PSYC: "a1000000-0000-0000-0000-000000000008",
};

const ROOM_IDS = [
  "c1000000-0000-0000-0000-000000000001",
  "c1000000-0000-0000-0000-000000000002",
  "c1000000-0000-0000-0000-000000000003",
  "c1000000-0000-0000-0000-000000000004",
  "c1000000-0000-0000-0000-000000000005",
  "c1000000-0000-0000-0000-000000000006",
  "c1000000-0000-0000-0000-000000000007",
  "c1000000-0000-0000-0000-000000000008",
  "c1000000-0000-0000-0000-000000000009",
  "c1000000-0000-0000-0000-000000000010",
];

// ============================================================================
// FAKE STUDENTS (40 with diverse names reflecting UBC demographics)
// ============================================================================

interface FakeStudent {
  id: string;
  email: string;
  display_name: string;
  year: number;
  program: string;
  courses: string[];
}

const FAKE_STUDENTS: FakeStudent[] = [
  { id: "d1000000-0000-0000-0000-000000000001", email: "kevin.chen@student.ubc.ca", display_name: "Kevin Chen", year: 3, program: "Computer Science", courses: ["CPSC 221", "MATH 221", "STAT 200"] },
  { id: "d1000000-0000-0000-0000-000000000002", email: "priya.sharma@student.ubc.ca", display_name: "Priya Sharma", year: 2, program: "Mathematics", courses: ["MATH 200", "CPSC 110", "STAT 200"] },
  { id: "d1000000-0000-0000-0000-000000000003", email: "james.wilson@student.ubc.ca", display_name: "James Wilson", year: 4, program: "Physics", courses: ["PHYS 301", "MATH 302", "CPSC 313"] },
  { id: "d1000000-0000-0000-0000-000000000004", email: "mei.lin@student.ubc.ca", display_name: "Mei Lin", year: 2, program: "Chemistry", courses: ["CHEM 233", "BIOL 200", "MATH 200"] },
  { id: "d1000000-0000-0000-0000-000000000005", email: "arjun.patel@student.ubc.ca", display_name: "Arjun Patel", year: 3, program: "Computer Science", courses: ["CPSC 221", "CPSC 313", "STAT 302"] },
  { id: "d1000000-0000-0000-0000-000000000006", email: "sarah.johnson@student.ubc.ca", display_name: "Sarah Johnson", year: 1, program: "Biology", courses: ["BIOL 112", "CHEM 121", "MATH 200"] },
  { id: "d1000000-0000-0000-0000-000000000007", email: "yuki.tanaka@student.ubc.ca", display_name: "Yuki Tanaka", year: 3, program: "Statistics", courses: ["STAT 302", "MATH 302", "CPSC 221"] },
  { id: "d1000000-0000-0000-0000-000000000008", email: "hassan.ali@student.ubc.ca", display_name: "Hassan Ali", year: 2, program: "Economics", courses: ["ECON 101", "STAT 200", "MATH 221"] },
  { id: "d1000000-0000-0000-0000-000000000009", email: "emma.zhang@student.ubc.ca", display_name: "Emma Zhang", year: 4, program: "Cognitive Systems", courses: ["CPSC 313", "PSYC 304", "STAT 302"] },
  { id: "d1000000-0000-0000-0000-000000000010", email: "ravi.kumar@student.ubc.ca", display_name: "Ravi Kumar", year: 2, program: "Engineering Physics", courses: ["PHYS 210", "MATH 221", "CPSC 110"] },
  { id: "d1000000-0000-0000-0000-000000000011", email: "jessica.lee@student.ubc.ca", display_name: "Jessica Lee", year: 3, program: "Psychology", courses: ["PSYC 217", "PSYC 304", "STAT 200"] },
  { id: "d1000000-0000-0000-0000-000000000012", email: "daniel.park@student.ubc.ca", display_name: "Daniel Park", year: 2, program: "Computer Science", courses: ["CPSC 110", "CPSC 221", "MATH 200"] },
  { id: "d1000000-0000-0000-0000-000000000013", email: "aisha.rahman@student.ubc.ca", display_name: "Aisha Rahman", year: 3, program: "Biochemistry", courses: ["CHEM 233", "BIOL 200", "CHEM 301"] },
  { id: "d1000000-0000-0000-0000-000000000014", email: "lucas.martinez@student.ubc.ca", display_name: "Lucas Martinez", year: 1, program: "Arts", courses: ["ECON 101", "PSYC 101", "STAT 200"] },
  { id: "d1000000-0000-0000-0000-000000000015", email: "wendy.wu@student.ubc.ca", display_name: "Wendy Wu", year: 4, program: "Data Science", courses: ["STAT 404", "CPSC 313", "MATH 302"] },
  { id: "d1000000-0000-0000-0000-000000000016", email: "michael.nguyen@student.ubc.ca", display_name: "Michael Nguyen", year: 2, program: "Computer Science", courses: ["CPSC 221", "MATH 221", "PHYS 118"] },
  { id: "d1000000-0000-0000-0000-000000000017", email: "sofia.garcia@student.ubc.ca", display_name: "Sofia Garcia", year: 3, program: "Biology", courses: ["BIOL 300", "CHEM 233", "STAT 200"] },
  { id: "d1000000-0000-0000-0000-000000000018", email: "jun.kim@student.ubc.ca", display_name: "Jun Kim", year: 2, program: "Mathematics", courses: ["MATH 221", "MATH 200", "STAT 302"] },
  { id: "d1000000-0000-0000-0000-000000000019", email: "olivia.brown@student.ubc.ca", display_name: "Olivia Brown", year: 1, program: "Psychology", courses: ["PSYC 101", "PSYC 217", "BIOL 112"] },
  { id: "d1000000-0000-0000-0000-000000000020", email: "takeshi.yamamoto@student.ubc.ca", display_name: "Takeshi Yamamoto", year: 4, program: "Physics", courses: ["PHYS 301", "PHYS 210", "MATH 302"] },
  { id: "d1000000-0000-0000-0000-000000000021", email: "nina.volkov@student.ubc.ca", display_name: "Nina Volkov", year: 3, program: "Chemistry", courses: ["CHEM 301", "CHEM 233", "PHYS 118"] },
  { id: "d1000000-0000-0000-0000-000000000022", email: "ethan.wright@student.ubc.ca", display_name: "Ethan Wright", year: 2, program: "Economics", courses: ["ECON 301", "ECON 325", "STAT 302"] },
  { id: "d1000000-0000-0000-0000-000000000023", email: "ananya.gupta@student.ubc.ca", display_name: "Ananya Gupta", year: 3, program: "Computer Science", courses: ["CPSC 313", "CPSC 221", "MATH 302"] },
  { id: "d1000000-0000-0000-0000-000000000024", email: "ryan.campbell@student.ubc.ca", display_name: "Ryan Campbell", year: 1, program: "Combined Major in Science", courses: ["MATH 200", "PHYS 118", "CHEM 121"] },
  { id: "d1000000-0000-0000-0000-000000000025", email: "hana.suzuki@student.ubc.ca", display_name: "Hana Suzuki", year: 2, program: "Statistics", courses: ["STAT 200", "STAT 302", "ECON 101"] },
  { id: "d1000000-0000-0000-0000-000000000026", email: "david.liu@student.ubc.ca", display_name: "David Liu", year: 3, program: "Computer Science", courses: ["CPSC 221", "CPSC 110", "STAT 200"] },
  { id: "d1000000-0000-0000-0000-000000000027", email: "fatima.hassan@student.ubc.ca", display_name: "Fatima Hassan", year: 2, program: "Biology", courses: ["BIOL 200", "BIOL 112", "CHEM 121"] },
  { id: "d1000000-0000-0000-0000-000000000028", email: "alex.thompson@student.ubc.ca", display_name: "Alex Thompson", year: 4, program: "Mathematics", courses: ["MATH 302", "STAT 404", "CPSC 313"] },
  { id: "d1000000-0000-0000-0000-000000000029", email: "suki.wong@student.ubc.ca", display_name: "Suki Wong", year: 2, program: "Commerce", courses: ["ECON 101", "ECON 301", "STAT 200"] },
  { id: "d1000000-0000-0000-0000-000000000030", email: "omar.hussein@student.ubc.ca", display_name: "Omar Hussein", year: 3, program: "Engineering Physics", courses: ["PHYS 301", "CPSC 221", "MATH 221"] },
  { id: "d1000000-0000-0000-0000-000000000031", email: "chloe.anderson@student.ubc.ca", display_name: "Chloe Anderson", year: 1, program: "Psychology", courses: ["PSYC 101", "BIOL 112", "STAT 200"] },
  { id: "d1000000-0000-0000-0000-000000000032", email: "wei.zhang@student.ubc.ca", display_name: "Wei Zhang", year: 3, program: "Data Science", courses: ["STAT 302", "CPSC 221", "MATH 221"] },
  { id: "d1000000-0000-0000-0000-000000000033", email: "isabella.rossi@student.ubc.ca", display_name: "Isabella Rossi", year: 2, program: "Chemistry", courses: ["CHEM 121", "CHEM 233", "MATH 200"] },
  { id: "d1000000-0000-0000-0000-000000000034", email: "josh.taylor@student.ubc.ca", display_name: "Josh Taylor", year: 4, program: "Computer Science", courses: ["CPSC 313", "STAT 404", "ECON 325"] },
  { id: "d1000000-0000-0000-0000-000000000035", email: "mina.park@student.ubc.ca", display_name: "Mina Park", year: 2, program: "Biochemistry", courses: ["BIOL 200", "CHEM 233", "STAT 200"] },
  { id: "d1000000-0000-0000-0000-000000000036", email: "nathan.singh@student.ubc.ca", display_name: "Nathan Singh", year: 3, program: "Economics", courses: ["ECON 325", "ECON 301", "MATH 221"] },
  { id: "d1000000-0000-0000-0000-000000000037", email: "lily.chen@student.ubc.ca", display_name: "Lily Chen", year: 1, program: "Computer Science", courses: ["CPSC 110", "MATH 200", "PHYS 118"] },
  { id: "d1000000-0000-0000-0000-000000000038", email: "marcus.williams@student.ubc.ca", display_name: "Marcus Williams", year: 2, program: "Physics", courses: ["PHYS 210", "PHYS 118", "MATH 221"] },
  { id: "d1000000-0000-0000-0000-000000000039", email: "sakura.ito@student.ubc.ca", display_name: "Sakura Ito", year: 3, program: "Psychology", courses: ["PSYC 304", "PSYC 217", "STAT 302"] },
  { id: "d1000000-0000-0000-0000-000000000040", email: "chris.lee@student.ubc.ca", display_name: "Chris Lee", year: 2, program: "Statistics", courses: ["STAT 200", "MATH 200", "ECON 101"] },
];

// ============================================================================
// REALISTIC STUDENT NOTES (messy, varying confidence signals)
// At least 24 students across 6 courses
// ============================================================================

interface NoteData {
  studentIdx: number;
  courseCode: string;
  text: string;
}

const STUDENT_NOTES: NoteData[] = [
  // --- CPSC 221 (6 students) ---
  { studentIdx: 0, courseCode: "CPSC 221", text: "BST property: left < root < right. Insert O(h). Delete 3 cases. AVL rotations confuse me - LR vs RL??? TODO: practice before midterm. Balanced = O(log n) guaranteed." },
  { studentIdx: 4, courseCode: "CPSC 221", text: "Hash tables: chaining vs open addressing. Load factor a = n/m. I get chaining but linear probing clustering is confusing. Why does it bunch up? Resize at 0.75. Amortized O(1)." },
  { studentIdx: 11, courseCode: "CPSC 221", text: "Stacks LIFO, Queues FIFO. Priority queue = heap! Insert bubble up O(log n), delete max bubble down. Build heap O(n) - why not O(n log n)? Array: parent=(i-1)/2, left=2i+1." },
  { studentIdx: 15, courseCode: "CPSC 221", text: "Graphs: adj matrix O(V^2) space, adj list O(V+E). BFS=queue finds shortest path. DFS=stack for cycle detection. Dijkstra with min-heap O((V+E)logV). Why no negative weights??" },
  { studentIdx: 22, courseCode: "CPSC 221", text: "Sorting review: mergesort O(n log n) stable, quicksort O(n log n) avg but O(n^2) worst. Radix sort O(d*n) for fixed-length keys. When to use which? Quicksort fastest in practice due to cache." },
  { studentIdx: 29, courseCode: "CPSC 221", text: "Kruskal's MST: sort edges, union-find to avoid cycles. Prim's: grow from vertex using priority queue. Both O(E log V). I understand Kruskal but Prim's priority queue updates confuse me." },
  // --- MATH 200 (5 students) ---
  { studentIdx: 1, courseCode: "MATH 200", text: "Partial derivatives: treat other vars as constants. Chain rule for multivariable is wild. Gradient = vector of partials, points in direction of steepest ascent. Directional derivative = grad dot unit vector." },
  { studentIdx: 3, courseCode: "MATH 200", text: "Double integrals: iterated integrals, switch order when needed. Polar coords for circles: r dr dtheta. I keep messing up the Jacobian. Triple integrals in cylindrical/spherical - need more practice." },
  { studentIdx: 5, courseCode: "MATH 200", text: "Lagrange multipliers for constrained optimization. Set grad f = lambda * grad g. Solve system of equations. I get the setup but solving the system algebraically is so tedious. When do we use 2 constraints?" },
  { studentIdx: 11, courseCode: "MATH 200", text: "Green's theorem: line integral = double integral of curl. Stokes' theorem generalizes this to 3D. Divergence theorem: flux integral = triple integral of div. These all feel the same to me???" },
  { studentIdx: 17, courseCode: "MATH 200", text: "Vector fields, line integrals, conservative fields. F is conservative iff curl F = 0 iff path independent iff F = grad phi. Finding potential functions is straightforward but checking curl in 3D is error-prone." },
  // --- STAT 200 (5 students) ---
  { studentIdx: 0, courseCode: "STAT 200", text: "Hypothesis testing: H0 vs Ha, p-value = prob of observing data this extreme if H0 true. Reject H0 if p < alpha. Type I = false positive, Type II = false negative. Power = 1 - beta. Confidence intervals vs hypothesis tests are two sides of same coin." },
  { studentIdx: 7, courseCode: "STAT 200", text: "Central limit theorem: sample means ~ Normal(mu, sigma/sqrt(n)) for large n. This is why everything uses z-tests and t-tests! t-test when sigma unknown (which is always in practice). df = n-1 for one sample." },
  { studentIdx: 13, courseCode: "STAT 200", text: "Regression: y = b0 + b1*x + error. Least squares minimizes sum of squared residuals. R^2 = proportion of variance explained. I get simple regression but multiple regression interpretation is confusing - 'holding other vars constant' ???" },
  { studentIdx: 24, courseCode: "STAT 200", text: "Chi-squared test for categorical data. Expected counts = row total * col total / grand total. Test stat = sum((O-E)^2/E). df = (r-1)(c-1). Conditions: all expected counts >= 5. When to use Fisher exact test instead?" },
  { studentIdx: 30, courseCode: "STAT 200", text: "ANOVA: comparing 3+ group means. F = MSbetween/MSwithin. If F large, reject H0 that all means equal. Post-hoc: Tukey HSD for pairwise comparisons. Assumptions: normal populations, equal variances, independence." },
  // --- CHEM 233 (4 students) ---
  { studentIdx: 3, courseCode: "CHEM 233", text: "SN1 vs SN2: SN2 = backside attack, inversion, strong nuc, primary/methyl. SN1 = carbocation intermediate, racemization, weak nuc, tertiary. I always mix up E1 vs E2 conditions with substitution." },
  { studentIdx: 12, courseCode: "CHEM 233", text: "Stereochemistry: R/S configuration using CIP priority rules. Enantiomers = mirror images, diastereomers = not mirror images. Meso compounds have internal plane of symmetry. Optical activity cancels in meso." },
  { studentIdx: 16, courseCode: "CHEM 233", text: "Carbonyl chemistry: nucleophilic addition for aldehydes/ketones, nucleophilic acyl substitution for acid derivatives. Reactivity order: acid chloride > anhydride > ester > amide. Grignard reactions are cool but sensitive to water." },
  { studentIdx: 32, courseCode: "CHEM 233", text: "Aromatic compounds: Huckel's rule 4n+2 pi electrons. EAS: electrophilic aromatic substitution. Activating/deactivating groups, ortho-para vs meta directors. Synthesis strategy: order of reactions matters for regiochemistry!" },
  // --- PSYC 101 (4 students) ---
  { studentIdx: 13, courseCode: "PSYC 101", text: "Classical conditioning: Pavlov, CS-US pairing. Operant: Skinner, reinforcement/punishment. Positive = add, negative = remove. Schedules of reinforcement: ratio vs interval, fixed vs variable. Variable ratio most resistant to extinction." },
  { studentIdx: 18, courseCode: "PSYC 101", text: "Memory: encoding -> storage -> retrieval. Sensory -> short-term (7+/-2 items) -> long-term. Levels of processing: deeper = better retention. I struggle with distinguishing episodic vs semantic memory clearly." },
  { studentIdx: 30, courseCode: "PSYC 101", text: "Neurotransmitters: dopamine (reward/motivation), serotonin (mood), GABA (inhibition), glutamate (excitation). Agonists enhance, antagonists block. SSRIs block serotonin reuptake. Brain regions: prefrontal=planning, amygdala=emotion, hippocampus=memory." },
  { studentIdx: 39, courseCode: "PSYC 101", text: "Social psych: conformity (Asch), obedience (Milgram), bystander effect (diffusion of responsibility). Attribution: fundamental attribution error = overweight dispositional, underweight situational for others. Self-serving bias for ourselves." },
  // --- ECON 101 (4 students) ---
  { studentIdx: 7, courseCode: "ECON 101", text: "Supply and demand: equilibrium where S=D. Shifts vs movements along curve. Price elasticity = %change Q / %change P. Elastic > 1, inelastic < 1. Perfectly inelastic = vertical. Tax incidence depends on elasticity." },
  { studentIdx: 13, courseCode: "ECON 101", text: "Consumer surplus = willingness to pay - actual price. Producer surplus = price received - marginal cost. Total surplus maximized at competitive equilibrium. Deadweight loss from taxes/price controls. Struggling with calculating DWL from graphs." },
  { studentIdx: 24, courseCode: "ECON 101", text: "Market structures: perfect competition (many firms, identical product, price taker), monopoly (one firm, price maker, MR < P), oligopoly (few firms, strategic interaction). Monopoly profit max: MR = MC." },
  { studentIdx: 28, courseCode: "ECON 101", text: "Externalities: positive (education) or negative (pollution). Market overproduces negative, underproduces positive. Solutions: Pigouvian tax, cap-and-trade, Coase theorem (low transaction costs). Public goods: non-rival, non-excludable -> free rider problem." },
];

// ============================================================================
// PRE-COMPUTED TOPIC PROFILES (complementary for good matching)
// ============================================================================

interface TopicEntry {
  topic: string;
  confidence: number;
  status: "learning" | "reviewing" | "stuck";
}

interface TopicProfileData {
  studentIdx: number;
  courseCode: string;
  topics: TopicEntry[];
  overall_pace: "behind" | "on_track" | "ahead";
  summary: string;
}

const TOPIC_PROFILES: TopicProfileData[] = [
  // CPSC 221 profiles - complementary: some strong in trees, weak in graphs, etc.
  { studentIdx: 0, courseCode: "CPSC 221", topics: [
    { topic: "Binary Search Trees", confidence: 4, status: "reviewing" },
    { topic: "AVL Rotations", confidence: 2, status: "stuck" },
    { topic: "Hash Tables", confidence: 3, status: "learning" },
    { topic: "Graphs", confidence: 4, status: "reviewing" },
    { topic: "Sorting", confidence: 5, status: "reviewing" },
  ], overall_pace: "on_track", summary: "Strong on trees and sorting, struggles with AVL rotations." },
  { studentIdx: 4, courseCode: "CPSC 221", topics: [
    { topic: "Binary Search Trees", confidence: 3, status: "learning" },
    { topic: "AVL Rotations", confidence: 5, status: "reviewing" },
    { topic: "Hash Tables", confidence: 2, status: "stuck" },
    { topic: "Graphs", confidence: 3, status: "learning" },
    { topic: "Sorting", confidence: 4, status: "reviewing" },
  ], overall_pace: "on_track", summary: "Mastered AVL rotations, hash table probing still unclear." },
  { studentIdx: 11, courseCode: "CPSC 221", topics: [
    { topic: "Binary Search Trees", confidence: 3, status: "learning" },
    { topic: "Stacks and Queues", confidence: 5, status: "reviewing" },
    { topic: "Priority Queues", confidence: 4, status: "reviewing" },
    { topic: "Hash Tables", confidence: 3, status: "learning" },
    { topic: "Graphs", confidence: 2, status: "stuck" },
  ], overall_pace: "on_track", summary: "Excellent with linear data structures, graphs are the weak spot." },
  { studentIdx: 15, courseCode: "CPSC 221", topics: [
    { topic: "Graphs", confidence: 5, status: "reviewing" },
    { topic: "BFS/DFS", confidence: 5, status: "reviewing" },
    { topic: "Dijkstra's Algorithm", confidence: 2, status: "stuck" },
    { topic: "Sorting", confidence: 4, status: "reviewing" },
    { topic: "Hash Tables", confidence: 4, status: "reviewing" },
  ], overall_pace: "ahead", summary: "Strong graph intuition but Dijkstra's correctness proof is unclear." },
  { studentIdx: 22, courseCode: "CPSC 221", topics: [
    { topic: "Sorting", confidence: 5, status: "reviewing" },
    { topic: "Hash Tables", confidence: 5, status: "reviewing" },
    { topic: "Binary Search Trees", confidence: 2, status: "stuck" },
    { topic: "Graphs", confidence: 3, status: "learning" },
    { topic: "MST Algorithms", confidence: 4, status: "reviewing" },
  ], overall_pace: "ahead", summary: "Sorting and hashing expert, needs help with tree structures." },
  { studentIdx: 29, courseCode: "CPSC 221", topics: [
    { topic: "MST Algorithms", confidence: 3, status: "learning" },
    { topic: "Graphs", confidence: 4, status: "reviewing" },
    { topic: "Binary Search Trees", confidence: 5, status: "reviewing" },
    { topic: "AVL Rotations", confidence: 4, status: "reviewing" },
    { topic: "Hash Tables", confidence: 2, status: "stuck" },
  ], overall_pace: "on_track", summary: "Tree expert, struggling with hash table implementations." },
  // MATH 200 profiles
  { studentIdx: 1, courseCode: "MATH 200", topics: [
    { topic: "Partial Derivatives", confidence: 5, status: "reviewing" },
    { topic: "Chain Rule", confidence: 3, status: "learning" },
    { topic: "Double Integrals", confidence: 2, status: "stuck" },
    { topic: "Vector Fields", confidence: 4, status: "reviewing" },
  ], overall_pace: "on_track", summary: "Solid on differentiation, integration in multiple dimensions is challenging." },
  { studentIdx: 3, courseCode: "MATH 200", topics: [
    { topic: "Double Integrals", confidence: 4, status: "reviewing" },
    { topic: "Polar Coordinates", confidence: 2, status: "stuck" },
    { topic: "Triple Integrals", confidence: 3, status: "learning" },
    { topic: "Lagrange Multipliers", confidence: 4, status: "reviewing" },
  ], overall_pace: "on_track", summary: "Good at integration, polar coordinate transformations need work." },
  { studentIdx: 5, courseCode: "MATH 200", topics: [
    { topic: "Lagrange Multipliers", confidence: 4, status: "reviewing" },
    { topic: "Gradient", confidence: 5, status: "reviewing" },
    { topic: "Double Integrals", confidence: 3, status: "learning" },
    { topic: "Green's Theorem", confidence: 1, status: "stuck" },
  ], overall_pace: "behind", summary: "Optimization is strong, fundamental theorems of calculus still confusing." },
  { studentIdx: 11, courseCode: "MATH 200", topics: [
    { topic: "Green's Theorem", confidence: 4, status: "reviewing" },
    { topic: "Stokes' Theorem", confidence: 3, status: "learning" },
    { topic: "Divergence Theorem", confidence: 3, status: "learning" },
    { topic: "Partial Derivatives", confidence: 2, status: "stuck" },
  ], overall_pace: "behind", summary: "Understands big theorems conceptually but basics need reinforcement." },
  { studentIdx: 17, courseCode: "MATH 200", topics: [
    { topic: "Vector Fields", confidence: 5, status: "reviewing" },
    { topic: "Line Integrals", confidence: 4, status: "reviewing" },
    { topic: "Conservative Fields", confidence: 5, status: "reviewing" },
    { topic: "Triple Integrals", confidence: 2, status: "stuck" },
  ], overall_pace: "ahead", summary: "Excellent vector calculus intuition, triple integrals need practice." },
  // STAT 200 profiles
  { studentIdx: 0, courseCode: "STAT 200", topics: [
    { topic: "Hypothesis Testing", confidence: 4, status: "reviewing" },
    { topic: "Confidence Intervals", confidence: 5, status: "reviewing" },
    { topic: "Regression", confidence: 3, status: "learning" },
    { topic: "ANOVA", confidence: 2, status: "stuck" },
  ], overall_pace: "on_track", summary: "Strong inferential stats, needs work on ANOVA and multi-group comparisons." },
  { studentIdx: 7, courseCode: "STAT 200", topics: [
    { topic: "Central Limit Theorem", confidence: 5, status: "reviewing" },
    { topic: "T-tests", confidence: 4, status: "reviewing" },
    { topic: "Chi-squared", confidence: 2, status: "stuck" },
    { topic: "Regression", confidence: 3, status: "learning" },
  ], overall_pace: "on_track", summary: "Great theoretical understanding, categorical data analysis is weak." },
  { studentIdx: 13, courseCode: "STAT 200", topics: [
    { topic: "Regression", confidence: 3, status: "learning" },
    { topic: "Multiple Regression", confidence: 1, status: "stuck" },
    { topic: "Hypothesis Testing", confidence: 4, status: "reviewing" },
    { topic: "Probability", confidence: 5, status: "reviewing" },
  ], overall_pace: "on_track", summary: "Probability whiz, multiple regression interpretation is confusing." },
  { studentIdx: 24, courseCode: "STAT 200", topics: [
    { topic: "Chi-squared", confidence: 5, status: "reviewing" },
    { topic: "ANOVA", confidence: 4, status: "reviewing" },
    { topic: "Hypothesis Testing", confidence: 3, status: "learning" },
    { topic: "Confidence Intervals", confidence: 2, status: "stuck" },
  ], overall_pace: "behind", summary: "Good at multi-group analysis, foundational inference concepts need work." },
  { studentIdx: 30, courseCode: "STAT 200", topics: [
    { topic: "ANOVA", confidence: 5, status: "reviewing" },
    { topic: "Regression", confidence: 4, status: "reviewing" },
    { topic: "Probability", confidence: 2, status: "stuck" },
    { topic: "Sampling", confidence: 3, status: "learning" },
  ], overall_pace: "on_track", summary: "Strong applied stats, probability theory foundations are shaky." },
  // CHEM 233 profiles
  { studentIdx: 3, courseCode: "CHEM 233", topics: [
    { topic: "SN1/SN2 Reactions", confidence: 3, status: "learning" },
    { topic: "Elimination Reactions", confidence: 1, status: "stuck" },
    { topic: "Stereochemistry", confidence: 4, status: "reviewing" },
    { topic: "Carbonyl Chemistry", confidence: 3, status: "learning" },
  ], overall_pace: "behind", summary: "Stereochemistry is solid, elimination vs substitution conditions confuse her." },
  { studentIdx: 12, courseCode: "CHEM 233", topics: [
    { topic: "Stereochemistry", confidence: 5, status: "reviewing" },
    { topic: "SN1/SN2 Reactions", confidence: 4, status: "reviewing" },
    { topic: "Carbonyl Chemistry", confidence: 2, status: "stuck" },
    { topic: "Aromatic Chemistry", confidence: 3, status: "learning" },
  ], overall_pace: "on_track", summary: "Excellent mechanistic understanding of substitution, carbonyl chemistry needs attention." },
  { studentIdx: 16, courseCode: "CHEM 233", topics: [
    { topic: "Carbonyl Chemistry", confidence: 5, status: "reviewing" },
    { topic: "Aromatic Chemistry", confidence: 4, status: "reviewing" },
    { topic: "Stereochemistry", confidence: 2, status: "stuck" },
    { topic: "SN1/SN2 Reactions", confidence: 3, status: "learning" },
  ], overall_pace: "ahead", summary: "Advanced synthesis skills, basic stereochemistry R/S assignments are weak." },
  { studentIdx: 32, courseCode: "CHEM 233", topics: [
    { topic: "Aromatic Chemistry", confidence: 5, status: "reviewing" },
    { topic: "Elimination Reactions", confidence: 4, status: "reviewing" },
    { topic: "SN1/SN2 Reactions", confidence: 4, status: "reviewing" },
    { topic: "Carbonyl Chemistry", confidence: 1, status: "stuck" },
  ], overall_pace: "on_track", summary: "Broad organic chemistry knowledge, carbonyl reactions are the main gap." },
  // PSYC 101 profiles
  { studentIdx: 13, courseCode: "PSYC 101", topics: [
    { topic: "Classical Conditioning", confidence: 5, status: "reviewing" },
    { topic: "Operant Conditioning", confidence: 4, status: "reviewing" },
    { topic: "Memory Systems", confidence: 2, status: "stuck" },
    { topic: "Neurotransmitters", confidence: 3, status: "learning" },
  ], overall_pace: "on_track", summary: "Learning theories are strong, memory systems and neuro need work." },
  { studentIdx: 18, courseCode: "PSYC 101", topics: [
    { topic: "Memory Systems", confidence: 4, status: "reviewing" },
    { topic: "Neurotransmitters", confidence: 2, status: "stuck" },
    { topic: "Classical Conditioning", confidence: 3, status: "learning" },
    { topic: "Social Psychology", confidence: 5, status: "reviewing" },
  ], overall_pace: "on_track", summary: "Strong on memory and social psych, neuroscience is the weak area." },
  { studentIdx: 30, courseCode: "PSYC 101", topics: [
    { topic: "Neurotransmitters", confidence: 5, status: "reviewing" },
    { topic: "Brain Regions", confidence: 4, status: "reviewing" },
    { topic: "Social Psychology", confidence: 2, status: "stuck" },
    { topic: "Operant Conditioning", confidence: 3, status: "learning" },
  ], overall_pace: "ahead", summary: "Bio psych is excellent, social psych concepts are poorly understood." },
  { studentIdx: 39, courseCode: "PSYC 101", topics: [
    { topic: "Social Psychology", confidence: 5, status: "reviewing" },
    { topic: "Attribution Theory", confidence: 4, status: "reviewing" },
    { topic: "Classical Conditioning", confidence: 1, status: "stuck" },
    { topic: "Memory Systems", confidence: 3, status: "learning" },
  ], overall_pace: "behind", summary: "Social psych expert, classical conditioning and learning theory are weak." },
  // ECON 101 profiles
  { studentIdx: 7, courseCode: "ECON 101", topics: [
    { topic: "Supply and Demand", confidence: 5, status: "reviewing" },
    { topic: "Elasticity", confidence: 4, status: "reviewing" },
    { topic: "Market Structures", confidence: 2, status: "stuck" },
    { topic: "Externalities", confidence: 3, status: "learning" },
  ], overall_pace: "on_track", summary: "Excellent micro foundations, market structures and welfare economics need work." },
  { studentIdx: 13, courseCode: "ECON 101", topics: [
    { topic: "Consumer/Producer Surplus", confidence: 4, status: "reviewing" },
    { topic: "Deadweight Loss", confidence: 2, status: "stuck" },
    { topic: "Supply and Demand", confidence: 5, status: "reviewing" },
    { topic: "Market Structures", confidence: 3, status: "learning" },
  ], overall_pace: "on_track", summary: "Good grasp of equilibrium, welfare analysis calculations are difficult." },
  { studentIdx: 24, courseCode: "ECON 101", topics: [
    { topic: "Market Structures", confidence: 5, status: "reviewing" },
    { topic: "Monopoly", confidence: 4, status: "reviewing" },
    { topic: "Elasticity", confidence: 2, status: "stuck" },
    { topic: "Supply and Demand", confidence: 3, status: "learning" },
  ], overall_pace: "behind", summary: "Understands market structures well, basic elasticity calculations confuse her." },
  { studentIdx: 28, courseCode: "ECON 101", topics: [
    { topic: "Externalities", confidence: 5, status: "reviewing" },
    { topic: "Public Goods", confidence: 5, status: "reviewing" },
    { topic: "Elasticity", confidence: 4, status: "reviewing" },
    { topic: "Consumer/Producer Surplus", confidence: 1, status: "stuck" },
  ], overall_pace: "ahead", summary: "Market failure expert, surplus calculations are surprisingly weak." },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getSubjectIdFromCourseCode(courseCode: string): string {
  const prefix = courseCode.split(" ")[0];
  return SUBJECT_IDS[prefix as keyof typeof SUBJECT_IDS];
}

function generateCheckinCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/** Get next weekday on or after the given date */
function nextWeekday(date: Date): Date {
  const d = new Date(date);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function seed() {
  console.log("🌱 Starting StudyHall UBC seed...\n");

  // Step 1: Run seed.sql for static reference data
  console.log("📄 Running seed.sql for subjects, courses, and rooms...");
  const seedSql = readFileSync(join(__dirname, "..", "supabase", "seed.sql"), "utf-8");
  const { error: sqlError } = await supabase.rpc("exec_sql", { sql: seedSql }).maybeSingle();
  if (sqlError) {
    // If rpc doesn't exist, try running statements individually
    console.log("  (rpc not available, inserting reference data via API...)");
    await seedReferenceDataViaApi();
  } else {
    console.log("  ✓ seed.sql executed successfully");
  }

  // Step 2: Clean up existing seed data (idempotent)
  console.log("\n🧹 Cleaning existing seed data...");
  await cleanSeedData();

  // Step 3: Create profiles
  console.log("\n👤 Creating 40 student profiles...");
  await seedProfiles();

  // Step 4: Create enrollments
  console.log("📚 Creating enrollments...");
  await seedEnrollments();

  // Step 5: Create note uploads
  console.log("📝 Creating note uploads...");
  await seedNoteUploads();

  // Step 6: Create topic profiles
  console.log("🧠 Creating topic profiles...");
  await seedTopicProfiles();

  // Step 7: Create study groups
  console.log("👥 Creating study groups...");
  await seedStudyGroups();

  // Step 8: Create sessions
  console.log("📅 Creating sessions...");
  await seedSessions();

  // Step 9: Create attendance/RSVPs
  console.log("✋ Creating attendance records...");
  await seedAttendance();

  console.log("\n✅ Seed complete!");
}

// ============================================================================
// SEED REFERENCE DATA VIA API (fallback if rpc not available)
// ============================================================================

async function seedReferenceDataViaApi() {
  // Subjects
  const subjects = [
    { id: "a1000000-0000-0000-0000-000000000001", code: "CPSC", name: "Computer Science", colour: "#3B82F6" },
    { id: "a1000000-0000-0000-0000-000000000002", code: "MATH", name: "Mathematics", colour: "#8B5CF6" },
    { id: "a1000000-0000-0000-0000-000000000003", code: "PHYS", name: "Physics", colour: "#EF4444" },
    { id: "a1000000-0000-0000-0000-000000000004", code: "CHEM", name: "Chemistry", colour: "#10B981" },
    { id: "a1000000-0000-0000-0000-000000000005", code: "BIOL", name: "Biology", colour: "#22C55E" },
    { id: "a1000000-0000-0000-0000-000000000006", code: "STAT", name: "Statistics", colour: "#F59E0B" },
    { id: "a1000000-0000-0000-0000-000000000007", code: "ECON", name: "Economics", colour: "#6366F1" },
    { id: "a1000000-0000-0000-0000-000000000008", code: "PSYC", name: "Psychology", colour: "#EC4899" },
  ];
  const { error: subErr } = await supabase.from("subjects").upsert(subjects, { onConflict: "id" });
  if (subErr) console.error("  subjects error:", subErr.message);
  else console.log("  ✓ 8 subjects");

  // Courses
  const courses = Object.entries(COURSE_IDS).map(([code, id]) => ({
    id,
    subject_id: getSubjectIdFromCourseCode(code),
    code,
    title: getCourseTitle(code),
    term: "2026W1",
  }));
  const { error: courseErr } = await supabase.from("courses").upsert(courses, { onConflict: "id" });
  if (courseErr) console.error("  courses error:", courseErr.message);
  else console.log("  ✓ 24 courses");

  // Rooms
  const rooms = [
    { id: "c1000000-0000-0000-0000-000000000001", name: "IKBLC 182", building: "Irving K. Barber Learning Centre", floor: "1", capacity: 20, map_url: "https://maps.ubc.ca/?code=IKBLC" },
    { id: "c1000000-0000-0000-0000-000000000002", name: "IKBLC 261", building: "Irving K. Barber Learning Centre", floor: "2", capacity: 16, map_url: "https://maps.ubc.ca/?code=IKBLC" },
    { id: "c1000000-0000-0000-0000-000000000003", name: "Koerner 216", building: "Koerner Library", floor: "2", capacity: 12, map_url: "https://maps.ubc.ca/?code=KOEL" },
    { id: "c1000000-0000-0000-0000-000000000004", name: "Koerner 302", building: "Koerner Library", floor: "3", capacity: 8, map_url: "https://maps.ubc.ca/?code=KOEL" },
    { id: "c1000000-0000-0000-0000-000000000005", name: "Woodward 4", building: "Woodward Library", floor: "B", capacity: 24, map_url: "https://maps.ubc.ca/?code=WOOD" },
    { id: "c1000000-0000-0000-0000-000000000006", name: "Woodward 8", building: "Woodward Library", floor: "B", capacity: 12, map_url: "https://maps.ubc.ca/?code=WOOD" },
    { id: "c1000000-0000-0000-0000-000000000007", name: "ICICS 246", building: "ICICS", floor: "2", capacity: 30, map_url: "https://maps.ubc.ca/?code=ICCS" },
    { id: "c1000000-0000-0000-0000-000000000008", name: "ICICS X150", building: "ICICS", floor: "1", capacity: 20, map_url: "https://maps.ubc.ca/?code=ICCS" },
    { id: "c1000000-0000-0000-0000-000000000009", name: "Nest 2306", building: "The Nest (AMS Student Union Building)", floor: "2", capacity: 16, map_url: "https://maps.ubc.ca/?code=NEST" },
    { id: "c1000000-0000-0000-0000-000000000010", name: "Nest 3301", building: "The Nest (AMS Student Union Building)", floor: "3", capacity: 10, map_url: "https://maps.ubc.ca/?code=NEST" },
  ];
  const { error: roomErr } = await supabase.from("rooms").upsert(rooms, { onConflict: "id" });
  if (roomErr) console.error("  rooms error:", roomErr.message);
  else console.log("  ✓ 10 rooms");
}

function getCourseTitle(code: string): string {
  const titles: Record<string, string> = {
    "CPSC 110": "Computation, Programs, and Programming",
    "CPSC 221": "Basic Algorithms and Data Structures",
    "CPSC 313": "Computer Hardware and Operating Systems",
    "MATH 200": "Calculus III",
    "MATH 221": "Matrix Algebra",
    "MATH 302": "Introduction to Probability",
    "PHYS 118": "Electricity, Light and Radiation",
    "PHYS 210": "Introduction to Relativity and Quantum Physics",
    "PHYS 301": "Electricity and Magnetism",
    "CHEM 121": "Structural Chemistry",
    "CHEM 233": "Organic Chemistry",
    "CHEM 301": "Aqueous Environmental Chemistry",
    "BIOL 112": "Cell Biology",
    "BIOL 200": "Fundamentals of Cell Biology",
    "BIOL 300": "Molecular Biology",
    "STAT 200": "Elementary Statistics",
    "STAT 302": "Introduction to Probability",
    "STAT 404": "Design and Analysis of Experiments",
    "ECON 101": "Principles of Microeconomics",
    "ECON 301": "Intermediate Microeconomics",
    "ECON 325": "Industrial Organization",
    "PSYC 101": "Introduction to Biological and Cognitive Psychology",
    "PSYC 217": "Research Methods",
    "PSYC 304": "Brain and Behaviour",
  };
  return titles[code] || code;
}

// ============================================================================
// CLEAN EXISTING SEED DATA
// ============================================================================

async function cleanSeedData() {
  // Delete in reverse dependency order
  const studentIds = FAKE_STUDENTS.map((s) => s.id);

  // Delete attendance for seed students
  await supabase.from("attendance").delete().in("user_id", studentIds);
  // Delete sessions for seed groups (we'll identify by group members)
  const { data: groupMemberRows } = await supabase
    .from("group_members")
    .select("group_id")
    .in("user_id", studentIds);
  if (groupMemberRows && groupMemberRows.length > 0) {
    const groupIds = [...new Set(groupMemberRows.map((r) => r.group_id))];
    await supabase.from("sessions").delete().in("group_id", groupIds);
    await supabase.from("group_members").delete().in("group_id", groupIds);
    await supabase.from("study_groups").delete().in("id", groupIds);
  }
  await supabase.from("topic_profiles").delete().in("user_id", studentIds);
  await supabase.from("note_uploads").delete().in("user_id", studentIds);
  await supabase.from("enrollments").delete().in("user_id", studentIds);
  await supabase.from("profiles").delete().in("id", studentIds);

  console.log("  ✓ Cleaned existing seed data");
}

// ============================================================================
// SEED PROFILES
// ============================================================================

async function seedProfiles() {
  const profiles = FAKE_STUDENTS.map((s) => ({
    id: s.id,
    email: s.email,
    display_name: s.display_name,
    year: s.year,
    program: s.program,
    avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(s.display_name)}`,
    onboarded: true,
  }));

  const { error } = await supabase.from("profiles").upsert(profiles, { onConflict: "id" });
  if (error) {
    console.error("  profiles error:", error.message);
  } else {
    console.log(`  ✓ ${profiles.length} profiles`);
  }
}

// ============================================================================
// SEED ENROLLMENTS
// ============================================================================

async function seedEnrollments() {
  const enrollments: { user_id: string; course_id: string }[] = [];
  for (const student of FAKE_STUDENTS) {
    for (const courseCode of student.courses) {
      enrollments.push({
        user_id: student.id,
        course_id: COURSE_IDS[courseCode],
      });
    }
  }

  const { error } = await supabase.from("enrollments").upsert(enrollments, { onConflict: "user_id,course_id" });
  if (error) {
    console.error("  enrollments error:", error.message);
  } else {
    console.log(`  ✓ ${enrollments.length} enrollments`);
  }
}

// ============================================================================
// SEED NOTE UPLOADS
// ============================================================================

async function seedNoteUploads() {
  const notes = STUDENT_NOTES.map((n) => ({
    user_id: FAKE_STUDENTS[n.studentIdx].id,
    course_id: COURSE_IDS[n.courseCode],
    raw_text: n.text,
    filename: `${n.courseCode.replace(" ", "_")}_notes.txt`,
  }));

  const { error } = await supabase.from("note_uploads").insert(notes);
  if (error) {
    console.error("  note_uploads error:", error.message);
  } else {
    console.log(`  ✓ ${notes.length} note uploads`);
  }
}

// ============================================================================
// SEED TOPIC PROFILES
// ============================================================================

async function seedTopicProfiles() {
  const profiles = TOPIC_PROFILES.map((tp) => ({
    user_id: FAKE_STUDENTS[tp.studentIdx].id,
    course_id: COURSE_IDS[tp.courseCode],
    topics: JSON.stringify(tp.topics),
    overall_pace: tp.overall_pace,
    summary: tp.summary,
  }));

  const { error } = await supabase.from("topic_profiles").upsert(profiles, { onConflict: "user_id,course_id" });
  if (error) {
    console.error("  topic_profiles error:", error.message);
  } else {
    console.log(`  ✓ ${profiles.length} topic profiles`);
  }
}

// ============================================================================
// SEED STUDY GROUPS
// ============================================================================

interface GroupDef {
  id: string;
  courseCode: string;
  name: string;
  rationale: string;
  memberIndices: number[];
}

const STUDY_GROUPS: GroupDef[] = [
  {
    id: "e1000000-0000-0000-0000-000000000001",
    courseCode: "CPSC 221",
    name: "Tree Traversers",
    rationale: "Members have complementary strengths in trees, graphs, and hashing.",
    memberIndices: [0, 4, 11, 15, 22],
  },
  {
    id: "e1000000-0000-0000-0000-000000000002",
    courseCode: "MATH 200",
    name: "Vector Voyagers",
    rationale: "Balanced strengths across integration, vector calculus, and optimization.",
    memberIndices: [1, 3, 5, 11, 17],
  },
  {
    id: "e1000000-0000-0000-0000-000000000003",
    courseCode: "STAT 200",
    name: "Data Detectives",
    rationale: "Complementary expertise in inference, regression, and probability.",
    memberIndices: [0, 7, 13, 24, 30],
  },
  {
    id: "e1000000-0000-0000-0000-000000000004",
    courseCode: "CHEM 233",
    name: "Reaction Pioneers",
    rationale: "Each member excels where others struggle in organic mechanisms.",
    memberIndices: [3, 12, 16, 32],
  },
  {
    id: "e1000000-0000-0000-0000-000000000005",
    courseCode: "PSYC 101",
    name: "Mind Mappers",
    rationale: "Diverse strengths across learning, memory, neuro, and social psych.",
    memberIndices: [13, 18, 30, 39],
  },
  {
    id: "e1000000-0000-0000-0000-000000000006",
    courseCode: "ECON 101",
    name: "Market Movers",
    rationale: "Strong variety in micro theory, welfare analysis, and market structures.",
    memberIndices: [7, 13, 24, 28],
  },
];

async function seedStudyGroups() {
  const groups = STUDY_GROUPS.map((g) => ({
    id: g.id,
    course_id: COURSE_IDS[g.courseCode],
    name: g.name,
    rationale: g.rationale,
  }));

  const { error: groupErr } = await supabase.from("study_groups").upsert(groups, { onConflict: "id" });
  if (groupErr) {
    console.error("  study_groups error:", groupErr.message);
    return;
  }
  console.log(`  ✓ ${groups.length} study groups`);

  // Group members
  const members: { group_id: string; user_id: string }[] = [];
  for (const g of STUDY_GROUPS) {
    for (const idx of g.memberIndices) {
      members.push({ group_id: g.id, user_id: FAKE_STUDENTS[idx].id });
    }
  }
  const { error: memErr } = await supabase.from("group_members").upsert(members, { onConflict: "group_id,user_id" });
  if (memErr) console.error("  group_members error:", memErr.message);
  else console.log(`  ✓ ${members.length} group members`);
}

// ============================================================================
// SEED SESSIONS (today + next 5 days, several today, one within the hour)
// ============================================================================

async function seedSessions() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Generate session dates: today + next 5 days (skip weekends)
  const sessionDates: Date[] = [];
  let dayOffset = 0;
  while (sessionDates.length < 6) {
    const candidate = addDays(today, dayOffset);
    const day = candidate.getDay();
    if (day !== 0 && day !== 6) {
      sessionDates.push(candidate);
    }
    dayOffset++;
  }

  const sessionTimes = [
    { start: "09:00", end: "10:30" },
    { start: "11:00", end: "12:30" },
    { start: "13:00", end: "14:30" },
    { start: "14:00", end: "15:30" },
    { start: "15:30", end: "17:00" },
    { start: "17:00", end: "18:30" },
  ];

  // Create a session that starts within the hour
  const currentHour = now.getHours();
  const nearTimeStart = `${String(currentHour).padStart(2, "0")}:00`;
  const nearEndHour = currentHour + 1;
  const nearTimeEnd = `${String(nearEndHour < 24 ? nearEndHour : 23).padStart(2, "0")}:30`;

  interface SessionRow {
    id: string;
    group_id: string;
    room_id: string;
    subject_id: string;
    date: string;
    start_time: string;
    end_time: string;
    topic: string;
    goal: string;
    status: string;
    checkin_code: string;
  }

  const sessions: SessionRow[] = [];
  let sessionCounter = 0;
  let roomIdx = 0;

  const sessionTopics: Record<string, string[]> = {
    "CPSC 221": ["Binary Search Trees", "Hash Tables", "Graph Algorithms", "Sorting", "AVL Trees", "Heaps"],
    "MATH 200": ["Partial Derivatives", "Double Integrals", "Vector Fields", "Green's Theorem", "Lagrange Multipliers", "Line Integrals"],
    "STAT 200": ["Hypothesis Testing", "Regression", "ANOVA", "Chi-squared Tests", "Confidence Intervals", "Sampling"],
    "CHEM 233": ["SN1/SN2 Reactions", "Stereochemistry", "Carbonyl Chemistry", "Aromatic Substitution", "Elimination", "Synthesis"],
    "PSYC 101": ["Classical Conditioning", "Memory Systems", "Neurotransmitters", "Social Psychology", "Brain Regions", "Operant Conditioning"],
    "ECON 101": ["Supply and Demand", "Elasticity", "Market Structures", "Externalities", "Consumer Surplus", "Monopoly"],
  };

  for (const group of STUDY_GROUPS) {
    const topics = sessionTopics[group.courseCode] || ["Review", "Practice", "Q&A", "Exam Prep", "Concepts", "Problems"];
    const subjectId = getSubjectIdFromCourseCode(group.courseCode);

    for (let i = 0; i < 6; i++) {
      sessionCounter++;
      const dateIdx = i % sessionDates.length;
      const date = sessionDates[dateIdx];
      let time = sessionTimes[i % sessionTimes.length];

      // Make the first session of the first group start within the hour (today)
      if (sessionCounter === 1) {
        time = { start: nearTimeStart, end: nearTimeEnd };
      }

      sessions.push({
        id: `f1000000-0000-0000-0000-${String(sessionCounter).padStart(12, "0")}`,
        group_id: group.id,
        room_id: ROOM_IDS[roomIdx % ROOM_IDS.length],
        subject_id: subjectId,
        date: formatDate(date),
        start_time: time.start,
        end_time: time.end,
        topic: topics[i],
        goal: `Review and practice ${topics[i].toLowerCase()} concepts`,
        status: "scheduled",
        checkin_code: generateCheckinCode(),
      });
      roomIdx++;
    }
  }

  // Add extra sessions today to ensure "several today"
  const todayStr = formatDate(sessionDates[0]);
  const extraTodaySessions: SessionRow[] = [
    {
      id: `f1000000-0000-0000-0000-${String(sessionCounter + 1).padStart(12, "0")}`,
      group_id: STUDY_GROUPS[0].id,
      room_id: ROOM_IDS[3],
      subject_id: getSubjectIdFromCourseCode(STUDY_GROUPS[0].courseCode),
      date: todayStr,
      start_time: "16:00",
      end_time: "17:30",
      topic: "Midterm Review",
      goal: "Comprehensive review of all topics for upcoming midterm",
      status: "scheduled",
      checkin_code: generateCheckinCode(),
    },
    {
      id: `f1000000-0000-0000-0000-${String(sessionCounter + 2).padStart(12, "0")}`,
      group_id: STUDY_GROUPS[2].id,
      room_id: ROOM_IDS[6],
      subject_id: getSubjectIdFromCourseCode(STUDY_GROUPS[2].courseCode),
      date: todayStr,
      start_time: "18:00",
      end_time: "19:30",
      topic: "Problem Set Workshop",
      goal: "Work through difficult problem set questions together",
      status: "scheduled",
      checkin_code: generateCheckinCode(),
    },
  ];
  sessions.push(...extraTodaySessions);

  const { error } = await supabase.from("sessions").upsert(sessions, { onConflict: "id" });
  if (error) {
    console.error("  sessions error:", error.message);
  } else {
    console.log(`  ✓ ${sessions.length} sessions (${sessions.filter(s => s.date === todayStr).length} today)`);
  }

  // Store sessions for attendance seeding
  return sessions;
}

// ============================================================================
// SEED ATTENDANCE (3-6 RSVPs per session)
// ============================================================================

async function seedAttendance() {
  // Get all sessions we just created
  const sessionIds: string[] = [];
  let counter = 1;
  for (const group of STUDY_GROUPS) {
    for (let i = 0; i < 6; i++) {
      sessionIds.push(`f1000000-0000-0000-0000-${String(counter).padStart(12, "0")}`);
      counter++;
    }
  }
  // Add extra today sessions
  sessionIds.push(`f1000000-0000-0000-0000-${String(counter).padStart(12, "0")}`);
  sessionIds.push(`f1000000-0000-0000-0000-${String(counter + 1).padStart(12, "0")}`);

  const attendance: {
    session_id: string;
    user_id: string;
    status: string;
    rsvp_at: string;
    checked_in_at: string | null;
  }[] = [];

  const now = new Date().toISOString();

  for (let sIdx = 0; sIdx < sessionIds.length; sIdx++) {
    const sessionId = sessionIds[sIdx];
    // Find which group this session belongs to
    const groupIdx = Math.floor(sIdx / 6);
    const group = STUDY_GROUPS[groupIdx < STUDY_GROUPS.length ? groupIdx : 0];

    // Pick 3-6 attendees from the group members + some others
    const numAttendees = 3 + Math.floor(Math.random() * 4); // 3-6
    const possibleAttendees = [...group.memberIndices];

    // Add a few extra students who share the same course
    const courseCode = group.courseCode;
    for (const student of FAKE_STUDENTS) {
      if (student.courses.includes(courseCode)) {
        const idx = FAKE_STUDENTS.indexOf(student);
        if (!possibleAttendees.includes(idx)) {
          possibleAttendees.push(idx);
        }
      }
    }

    // Shuffle and pick
    const shuffled = possibleAttendees.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, numAttendees);

    for (const studentIdx of selected) {
      const checkedIn = Math.random() > 0.6;
      attendance.push({
        session_id: sessionId,
        user_id: FAKE_STUDENTS[studentIdx].id,
        status: checkedIn ? "checked_in" : "rsvp",
        rsvp_at: now,
        checked_in_at: checkedIn ? now : null,
      });
    }
  }

  const { error } = await supabase.from("attendance").upsert(attendance, { onConflict: "session_id,user_id" });
  if (error) {
    console.error("  attendance error:", error.message);
  } else {
    console.log(`  ✓ ${attendance.length} attendance records`);
  }
}

// ============================================================================
// RUN
// ============================================================================

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
