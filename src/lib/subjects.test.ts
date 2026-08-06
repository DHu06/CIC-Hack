import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

interface SubjectCard {
  id: string;
  code: string;
  enrolled: boolean;
}

function sortSubjects(subjects: SubjectCard[]): SubjectCard[] {
  return [...subjects].sort((a, b) => {
    if (a.enrolled && !b.enrolled) return -1;
    if (!a.enrolled && b.enrolled) return 1;
    return a.code.localeCompare(b.code);
  });
}

const subjectArb = fc.record({
  id: fc.uuid(),
  code: fc.string({ minLength: 2, maxLength: 6 }).map(s => s.toUpperCase()),
  enrolled: fc.boolean(),
});

describe("Subject pinning - Property Tests (Property 13)", () => {
  it("all enrolled subjects appear before all non-enrolled subjects", () => {
    fc.assert(
      fc.property(fc.array(subjectArb, { minLength: 1, maxLength: 20 }), (subjects) => {
        const sorted = sortSubjects(subjects);
        let foundNonEnrolled = false;
        for (const s of sorted) {
          if (!s.enrolled) foundNonEnrolled = true;
          if (s.enrolled && foundNonEnrolled) {
            // Enrolled after non-enrolled = violation
            expect(true).toBe(false);
          }
        }
      }),
      { numRuns: 200 }
    );
  });

  it("enrolled subjects are sorted alphabetically by code", () => {
    fc.assert(
      fc.property(fc.array(subjectArb, { minLength: 2, maxLength: 20 }), (subjects) => {
        const sorted = sortSubjects(subjects);
        const enrolled = sorted.filter(s => s.enrolled);
        for (let i = 1; i < enrolled.length; i++) {
          expect(enrolled[i].code.localeCompare(enrolled[i - 1].code)).toBeGreaterThanOrEqual(0);
        }
      }),
      { numRuns: 200 }
    );
  });

  it("non-enrolled subjects are sorted alphabetically by code", () => {
    fc.assert(
      fc.property(fc.array(subjectArb, { minLength: 2, maxLength: 20 }), (subjects) => {
        const sorted = sortSubjects(subjects);
        const notEnrolled = sorted.filter(s => !s.enrolled);
        for (let i = 1; i < notEnrolled.length; i++) {
          expect(notEnrolled[i].code.localeCompare(notEnrolled[i - 1].code)).toBeGreaterThanOrEqual(0);
        }
      }),
      { numRuns: 200 }
    );
  });

  it("no subjects are lost or duplicated during sort", () => {
    fc.assert(
      fc.property(fc.array(subjectArb, { minLength: 0, maxLength: 20 }), (subjects) => {
        const sorted = sortSubjects(subjects);
        expect(sorted.length).toBe(subjects.length);
        const inputIds = new Set(subjects.map(s => s.id));
        const outputIds = new Set(sorted.map(s => s.id));
        expect(outputIds).toEqual(inputIds);
      }),
      { numRuns: 200 }
    );
  });
});
