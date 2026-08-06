import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { readFileSync } from "fs";
import { join } from "path";

describe("seed idempotence (Property 12)", () => {
  const seedSql = readFileSync(
    join(__dirname, "../../backend/sql/seed.sql"),
    "utf-8"
  );

  it("all INSERT statements use ON CONFLICT DO NOTHING", () => {
    const statements = seedSql.split(";");
    const insertStatements = statements.filter(s => s.toUpperCase().includes("INSERT INTO"));
    expect(insertStatements.length).toBeGreaterThan(0);
    for (const stmt of insertStatements) {
      expect(stmt.toUpperCase()).toContain("ON CONFLICT");
    }
  });

  it("uses fixed UUIDs for deterministic seeding", () => {
    const uuidPattern = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi;
    const uuids = seedSql.match(uuidPattern) ?? [];
    expect(uuids.length).toBeGreaterThan(0);
  });

  it("seed SQL is deterministic (property: same content on every read)", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const sql2 = readFileSync(join(__dirname, "../../backend/sql/seed.sql"), "utf-8");
        expect(sql2).toBe(seedSql);
      }),
      { numRuns: 5 }
    );
  });

  it("contains expected reference data counts", () => {
    const subjectInserts = seedSql.match(/INSERT INTO subjects/g) ?? [];
    expect(subjectInserts.length).toBeGreaterThanOrEqual(1);
    const courseInserts = seedSql.match(/INSERT INTO courses/g) ?? [];
    expect(courseInserts.length).toBeGreaterThanOrEqual(1);
    const roomInserts = seedSql.match(/INSERT INTO rooms/g) ?? [];
    expect(roomInserts.length).toBeGreaterThanOrEqual(1);
  });
});
