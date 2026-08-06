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
