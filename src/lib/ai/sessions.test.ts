import { describe, it, expect } from "vitest";
import {
  generateCheckinCode,
  generateUniqueCheckinCodes,
  assignRoomsRoundRobin,
} from "./sessions";
import type { SessionPlan } from "./timeline";

describe("generateCheckinCode", () => {
  it("returns a 4-digit numeric string", () => {
    const code = generateCheckinCode();
    expect(code).toMatch(/^\d{4}$/);
    expect(Number(code)).toBeGreaterThanOrEqual(1000);
    expect(Number(code)).toBeLessThanOrEqual(9999);
  });

  it("returns different codes on multiple calls (probabilistic)", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 50; i++) {
      codes.add(generateCheckinCode());
    }
    // Very unlikely all 50 are the same
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe("generateUniqueCheckinCodes", () => {
  it("returns the requested number of codes", () => {
    const codes = generateUniqueCheckinCodes(6);
    expect(codes).toHaveLength(6);
  });

  it("all codes are unique", () => {
    const codes = generateUniqueCheckinCodes(6);
    const unique = new Set(codes);
    expect(unique.size).toBe(6);
  });

  it("all codes are valid 4-digit numeric strings", () => {
    const codes = generateUniqueCheckinCodes(10);
    for (const code of codes) {
      expect(code).toMatch(/^\d{4}$/);
    }
  });

  it("handles generating many codes without duplicates", () => {
    // 9000 possible values (1000-9999), generating 100 should be fine
    const codes = generateUniqueCheckinCodes(100);
    const unique = new Set(codes);
    expect(unique.size).toBe(100);
  });
});

describe("assignRoomsRoundRobin", () => {
  const makeSession = (topic: string): SessionPlan => ({
    date: "2025-02-10",
    start_time: "10:00",
    end_time: "11:30",
    topic,
    goal: `Study ${topic}`,
  });

  const rooms = [
    { id: "room-1", name: "IKB 101" },
    { id: "room-2", name: "IKB 102" },
    { id: "room-3", name: "IKB 103" },
  ];

  it("assigns rooms in round-robin order", () => {
    const sessions = [
      makeSession("A"),
      makeSession("B"),
      makeSession("C"),
      makeSession("D"),
      makeSession("E"),
      makeSession("F"),
    ];

    const result = assignRoomsRoundRobin(sessions, rooms);

    expect(result[0].roomId).toBe("room-1");
    expect(result[1].roomId).toBe("room-2");
    expect(result[2].roomId).toBe("room-3");
    expect(result[3].roomId).toBe("room-1"); // wraps around
    expect(result[4].roomId).toBe("room-2");
    expect(result[5].roomId).toBe("room-3");
  });

  it("preserves session plan data in output", () => {
    const sessions = [makeSession("Graphs"), makeSession("Trees")];
    const result = assignRoomsRoundRobin(sessions, rooms);

    expect(result[0].sessionPlan.topic).toBe("Graphs");
    expect(result[1].sessionPlan.topic).toBe("Trees");
  });

  it("throws if no rooms available", () => {
    const sessions = [makeSession("A")];
    expect(() => assignRoomsRoundRobin(sessions, [])).toThrow(
      "No rooms available for assignment"
    );
  });

  it("works with single room", () => {
    const sessions = [makeSession("A"), makeSession("B"), makeSession("C")];
    const singleRoom = [{ id: "room-1", name: "IKB 101" }];

    const result = assignRoomsRoundRobin(sessions, singleRoom);

    expect(result[0].roomId).toBe("room-1");
    expect(result[1].roomId).toBe("room-1");
    expect(result[2].roomId).toBe("room-1");
  });

  it("distributes rooms evenly (max difference of 1)", () => {
    const sessions = Array.from({ length: 7 }, (_, i) => makeSession(`T${i}`));
    const result = assignRoomsRoundRobin(sessions, rooms);

    const roomCounts: Record<string, number> = {};
    for (const r of result) {
      roomCounts[r.roomId] = (roomCounts[r.roomId] || 0) + 1;
    }

    const counts = Object.values(roomCounts);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    expect(max - min).toBeLessThanOrEqual(1);
  });
});

import fc from "fast-check";

// --- Arbitraries ---
const dateArb = fc.integer({ min: 1, max: 365 }).map(dayOfYear => {
  const d = new Date(2025, 0, dayOfYear);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

const sessionPlanArb = fc.record({
  date: dateArb,
  start_time: fc.constantFrom("09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00"),
  end_time: fc.constantFrom("10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30"),
  topic: fc.string({ minLength: 2, maxLength: 30 }),
  goal: fc.string({ minLength: 5, maxLength: 50 }),
});

const roomArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 3, maxLength: 20 }),
});

// --- Property 8: Room round-robin distribution ---
// **Validates: Requirements 6.5**
describe("Property 8: Room round-robin distribution", () => {
  it("assigns rooms in strict round-robin order: session[i] gets rooms[i % M]", () => {
    fc.assert(
      fc.property(
        fc.array(sessionPlanArb, { minLength: 1, maxLength: 30 }),
        fc.array(roomArb, { minLength: 1, maxLength: 10 }),
        (sessions, rooms) => {
          const result = assignRoomsRoundRobin(sessions, rooms);

          for (let i = 0; i < sessions.length; i++) {
            expect(result[i].roomId).toBe(rooms[i % rooms.length].id);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it("distributes rooms fairly: max count - min count <= 1", () => {
    fc.assert(
      fc.property(
        fc.array(sessionPlanArb, { minLength: 1, maxLength: 30 }),
        fc.array(roomArb, { minLength: 1, maxLength: 10 }),
        (sessions, rooms) => {
          const result = assignRoomsRoundRobin(sessions, rooms);

          // Count assignments per room
          const roomCounts: Record<string, number> = {};
          for (const r of result) {
            roomCounts[r.roomId] = (roomCounts[r.roomId] || 0) + 1;
          }

          const counts = Object.values(roomCounts);
          const maxCount = Math.max(...counts);
          const minCount = Math.min(...counts);
          expect(maxCount - minCount).toBeLessThanOrEqual(1);
        }
      ),
      { numRuns: 200 }
    );
  });
});

// --- Property 9: Check-in code format and uniqueness ---
// **Validates: Requirements 6.6**
describe("Property 9: Check-in code format and uniqueness", () => {
  it("generateCheckinCode always returns a 4-digit string between 1000 and 9999", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }), // dummy input to drive repetitions
        () => {
          const code = generateCheckinCode();
          expect(code).toMatch(/^\d{4}$/);
          const num = Number(code);
          expect(num).toBeGreaterThanOrEqual(1000);
          expect(num).toBeLessThanOrEqual(9999);
        }
      ),
      { numRuns: 500 }
    );
  });

  it("generateUniqueCheckinCodes(n) returns n distinct codes for n <= 100", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (n) => {
          const codes = generateUniqueCheckinCodes(n);
          expect(codes).toHaveLength(n);
          const uniqueSet = new Set(codes);
          expect(uniqueSet.size).toBe(n);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("every code in a batch matches /^\\d{4}$/", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        (n) => {
          const codes = generateUniqueCheckinCodes(n);
          for (const code of codes) {
            expect(code).toMatch(/^\d{4}$/);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
