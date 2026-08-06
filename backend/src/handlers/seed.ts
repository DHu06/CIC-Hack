import type { APIGatewayProxyResult } from "aws-lambda";
import { query } from "../lib/db.js";
import { success, serverError } from "../lib/response.js";

export async function seedDatabase(): Promise<APIGatewayProxyResult> {
  try {
    // Run the schema creation and seed data
    // This is a simplified version - in production you'd run the migration files
    
    // Check if data already exists
    const existing = await query(`SELECT COUNT(*) as count FROM subjects`);
    if (existing[0]?.count > 0) {
      return success({ message: "Database already seeded", seeded: false });
    }
    
    // Insert subjects
    await query(`
      INSERT INTO subjects (id, code, name, colour) VALUES
        ('a1000000-0000-0000-0000-000000000001', 'CPSC', 'Computer Science', '#3B82F6'),
        ('a1000000-0000-0000-0000-000000000002', 'MATH', 'Mathematics', '#8B5CF6'),
        ('a1000000-0000-0000-0000-000000000003', 'PHYS', 'Physics', '#EF4444'),
        ('a1000000-0000-0000-0000-000000000004', 'CHEM', 'Chemistry', '#10B981'),
        ('a1000000-0000-0000-0000-000000000005', 'BIOL', 'Biology', '#22C55E'),
        ('a1000000-0000-0000-0000-000000000006', 'STAT', 'Statistics', '#F59E0B'),
        ('a1000000-0000-0000-0000-000000000007', 'ECON', 'Economics', '#6366F1'),
        ('a1000000-0000-0000-0000-000000000008', 'PSYC', 'Psychology', '#EC4899')
      ON CONFLICT DO NOTHING
    `);
    
    // Insert rooms
    await query(`
      INSERT INTO rooms (id, name, building, floor, capacity) VALUES
        ('c1000000-0000-0000-0000-000000000001', 'IKBLC 182', 'Irving K. Barber Learning Centre', '1', 20),
        ('c1000000-0000-0000-0000-000000000002', 'IKBLC 261', 'Irving K. Barber Learning Centre', '2', 16),
        ('c1000000-0000-0000-0000-000000000003', 'Koerner 216', 'Koerner Library', '2', 12),
        ('c1000000-0000-0000-0000-000000000004', 'Koerner 302', 'Koerner Library', '3', 8),
        ('c1000000-0000-0000-0000-000000000005', 'Woodward 4', 'Woodward Library', 'B', 24),
        ('c1000000-0000-0000-0000-000000000006', 'Woodward 8', 'Woodward Library', 'B', 12),
        ('c1000000-0000-0000-0000-000000000007', 'ICICS 246', 'ICICS', '2', 30),
        ('c1000000-0000-0000-0000-000000000008', 'ICICS X150', 'ICICS', '1', 20),
        ('c1000000-0000-0000-0000-000000000009', 'Nest 2306', 'The Nest', '2', 16),
        ('c1000000-0000-0000-0000-000000000010', 'Nest 3301', 'The Nest', '3', 10)
      ON CONFLICT DO NOTHING
    `);
    
    return success({ message: "Database seeded successfully", seeded: true });
  } catch (err) {
    console.error("seedDatabase error:", err);
    return serverError("Failed to seed database");
  }
}
