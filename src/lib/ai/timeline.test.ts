import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { TimelineResultSchema } from "./timeline";

const weekdayDateArb = fc.date({ min: new Date("2025-01-06"), max: new Date("2025-12-31") })
  .filter(d => d.getDay() >= 1 && d.getDay() <= 5)
  .map(d => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });

const validTimeSlots = [
  { start_time: "09:00", end_time: "10:30" },
  { start_time: "10:00", end_time: "11:30" },
  { start_time: "11:00", end_time: "12:30" },
  { start_time: "13:00", end_time: "14:30" },
  { start_time: "14:00", end_time: "15:30" },
  { start_time: "15:00", end_time: "16:30" },
  { start_time: "16:00", end_time: "17:30" },
  { start_time: "18:00", end_time: "19:30" },
  { start_time: "18:30", end_time: "20:00" },
];

const validSessionArb = fc.record({
  date: weekdayDateArb,
  start_time: fc.constantFrom(...validTimeSlots).map(s => s.start_time),
  end_time: fc.constantFrom(...validTimeSlots).map(s => s.end_time),
  topic: fc.string({ minLength: 1, maxLength: 50 }),
  goal: fc.string({ minLength: 1, maxLength: 100 }),
});

describe("TimelineResultSchema - Property Tests (Property 6)", () => {
  it("valid 6-session timeline passes schema", () => {
    fc.assert(
      fc.property(
        fc.array(validSessionArb, { minLength: 6, maxLength: 6 }),
        (sessions) => {
          const result = TimelineResultSchema.safeParse({ sessions });
          expect(result.success).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("timeline with != 6 sessions fails schema", () => {
    fc.assert(
      fc.property(
        fc.array(validSessionArb, { minLength: 1, maxLength: 10 }).filter(a => a.length !== 6),
        (sessions) => {
          const result = TimelineResultSchema.safeParse({ sessions });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("sessions on weekdays have day 1-5", () => {
    fc.assert(
      fc.property(weekdayDateArb, (dateStr) => {
        const d = new Date(dateStr + "T12:00:00");
        const day = d.getDay();
        expect(day).toBeGreaterThanOrEqual(1);
        expect(day).toBeLessThanOrEqual(5);
      }),
      { numRuns: 200 }
    );
  });

  it("valid time slots are exactly 90 minutes apart", () => {
    for (const slot of validTimeSlots) {
      const [sh, sm] = slot.start_time.split(":").map(Number);
      const [eh, em] = slot.end_time.split(":").map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      expect(diff).toBe(90);
    }
  });
});
