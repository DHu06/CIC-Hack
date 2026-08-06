/**
 * StudyHall UBC Seed Script
 *
 * Creates 40 fake students, enrollments, note_uploads, topic_profiles,
 * study_groups, sessions, and attendance records.
 *
 * Usage: npm run seed
 * Requires: .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

// Load env from .env.local
const envPath = join(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"];
const serviceRoleKey = env["SUPABASE_SERVICE_ROLE_KEY"];

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

const SUBJECT_IDS = {
  CPSC: "a1000000-0000-0000-0000-000000000001",
  MATH: "a1000000-0000-0000-0000-000000000002",
  PHYS: "a1000000-0000-0000-0000-000000000003",
  CHEM: "a1000000-0000-0000-0000-000000000004",
  BIOL: "a1000000-0000-0000-0000-000000000005",
  STAT: "a1000000-0000-0000-0000-000000000006",
  ECON: "a1000000-0000-0000-0000-000000000007",
  PSYC: "a1000000-0000-0000-0000-000000000008",
};

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
  courses: string[]; // course codes
}

const PROGRAMS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Statistics",
  "Economics",
  "Psychology",
  "Engineering Physics",
  "Cognitive Systems",
  "Data Science",
  "Biochemistry",
  "Combined Major in Science",
  "Commerce",
  "Arts",
];

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
// REALISTIC STUDENT NOTES (messy, with confusion markers)
// ============================================================================

interface NoteData {
  studentIdx: number; // index into FAKE_STUDENTS
  courseCode: string;
  text: string;
}

const STUDENT_NOTES: NoteData[] = [
  // CPSC 221 notes
  {
    studentIdx: 0, courseCode: "CPSC 221",
    text: `Lecture 12 - Binary Search Trees
BST property: left < root < right for all subtrees
Insert: just follow the BST property down, O(h) where h = height
Delete cases:
  1. Leaf: just remove
  2. One child: replace with child
  3. Two children: find inorder successor (leftmost in right subtree), swap, delete from there
  
Balanced BSTs - WHY do we need them???
  - Worst case BST is basically a linked list O(n) 
  - AVL trees: balance factor = |height(left) - height(right)| <= 1
  - Rotations: LEFT rotation, RIGHT rotation
  
I GET the single rotations but double rotations (LR, RL) are confusing???
When do you use LR vs RL? something about the "zig-zag" pattern

Runtime: balanced BST = O(log n) for insert/search/delete
  - AVL guarantees this
  - Red-black trees also but we won't cover those apparently

TODO: practice rotation examples before midterm`
  },
  {
    studentIdx: 4, courseCode: "CPSC 221",
    text: `CPSC 221 - Week 6 Hash Tables

Hash function maps keys -> indices in array
Good hash function: uniform distribution, fast to compute, deterministic

Collision resolution:
1. Chaining (linked list at each slot)
   - Load factor α = n/m (items/slots)
   - Expected chain length = α
   - Search: O(1 + α) average

2. Open addressing (probe sequence)
   - Linear probing: h(k,i) = (h(k) + i) mod m
     CLUSTERING PROBLEM - elements bunch up
   - Quadratic probing: h(k,i) = (h(k) + c1*i + c2*i²) mod m
   - Double hashing: h(k,i) = (h1(k) + i*h2(k)) mod m

Load factor must stay < 1 for open addressing (< 0.75 ideally)
Resize when load factor exceeds threshold -> rehash everything O(n)

Amortized O(1) for insert with good hash + dynamic resizing

I'm solid on chaining but open addressing probe sequences confuse me still
especially: WHY does linear probing cause primary clustering?
Is it because consecutive filled slots form a "run" that grows linearly?`
  },
  {
    studentIdx: 11, courseCode: "CPSC 221",
    text: `Week 4 Notes - Stacks and Queues

Stack: LIFO - push/pop from top only
  - Array implementation: top pointer, O(1) push/pop
  - Linked list: push/pop at head
  - Applications: function calls, undo, parenthesis matching

Queue: FIFO - enqueue at back, dequeue from front
  - Circular array: front and back pointers, mod arithmetic
  - How does the circular part work again??? 
  - front = (front + 1) % capacity ... I think??
  
Priority Queue:
  - Like a queue but highest priority comes out first
  - Heap implementation!!! 
  - Binary heap: complete binary tree, heap property (parent >= children for max-heap)
  - Insert: add at end, bubble UP - O(log n)
  - Delete max: swap root with last, bubble DOWN - O(log n)
  - Build heap: O(n) using bottom-up heapify (NOT n log n!)
    Why is it O(n)? something about the sum of heights...

Array representation of heap:
  parent(i) = floor((i-1)/2)
  left(i) = 2i + 1
  right(i) = 2i + 2

This stuff I actually get pretty well!`
  },
  {
    studentIdx: 15, courseCode: "CPSC 221",
    text: `Graphs!! 

Representations:
- Adjacency matrix: V x V grid, O(V²) space, O(1) edge lookup
- Adjacency list: array of linked lists, O(V + E) space

BFS (Breadth-First Search):
  Uses a QUEUE
  Visit level by level
  Finds shortest path in unweighted graph
  Time: O(V + E)

DFS (Depth-First Search):
  Uses a STACK (or recursion)
  Goes deep before backtracking
  Applications: cycle detection, topological sort, connected components
  Time: O(V + E)

Dijkstra's:
  - Single source shortest path with NON-NEGATIVE weights
  - Uses priority queue (min-heap)
  - Greedy: always pick closest unvisited vertex
  - Time: O((V + E) log V) with binary heap
  
  Wait... why doesn't Dijkstra work with negative weights???
  Something about a shorter path being found after a node is "finalized"?
  Need to understand this better for the final

Topological sort:
  - Only for DAGs (directed acyclic graphs)
  - DFS-based: push to stack when done with all neighbors
  - Kahn's: repeatedly remove nodes with in-degree 0
  
I understand BFS/DFS well but Dijkstra's proof of correctness is fuzzy`
  },
