import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { TopicExtractionSchema } from "./extract";

const validTopicArb = fc.record({
  topic: fc.string({ minLength: 1, maxLength: 30 }),
  confidence: fc.integer({ min: 1, max: 5 }),
  status: fc.constantFrom("learning" as const, "reviewing" as const, "stuck" as const),
});

const validExtractionArb = fc.record({
  topics: fc.array(validTopicArb, { minLength: 1, maxLength: 8 }),
  overall_pace: fc.constantFrom("behind" as const, "on_track" as const, "ahead" as const),
  summary: fc.string({ minLength: 1, maxLength: 200 }),
});

describe("TopicExtractionSchema - Property Tests (Property 11)", () => {
  it("valid data always passes schema validation", () => {
    fc.assert(
      fc.property(validExtractionArb, (data) => {
        const result = TopicExtractionSchema.safeParse(data);
        expect(result.success).toBe(true);
      }),
      { numRuns: 200 }
    );
  });

  it("confidence outside 1-5 always fails", () => {
    fc.assert(
      fc.property(
        fc.integer().filter(n => n < 1 || n > 5),
        (badConfidence) => {
          const data = {
            topics: [{ topic: "test", confidence: badConfidence, status: "learning" }],
            overall_pace: "on_track",
            summary: "test",
          };
          const result = TopicExtractionSchema.safeParse(data);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("invalid status string always fails", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => !["learning", "reviewing", "stuck"].includes(s)),
        (badStatus) => {
          const data = {
            topics: [{ topic: "test", confidence: 3, status: badStatus }],
            overall_pace: "on_track",
            summary: "test",
          };
          const result = TopicExtractionSchema.safeParse(data);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("invalid overall_pace always fails", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => !["behind", "on_track", "ahead"].includes(s)),
        (badPace) => {
          const data = {
            topics: [{ topic: "test", confidence: 3, status: "learning" }],
            overall_pace: badPace,
            summary: "test",
          };
          const result = TopicExtractionSchema.safeParse(data);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("empty topics array always fails", () => {
    const data = { topics: [], overall_pace: "on_track", summary: "test" };
    const result = TopicExtractionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
