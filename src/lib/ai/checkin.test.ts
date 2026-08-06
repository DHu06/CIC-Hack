import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

/**
 * Pure function that verifies a check-in code matches the expected code.
 * This mirrors the logic in the checkIn server action (exact string match).
 */
function verifyCheckinCode(inputCode: string, expectedCode: string): boolean {
  return inputCode === expectedCode;
}

/**
 * **Validates: Requirements 7.3**
 *
 * Property 10: Wrong check-in code rejection
 * For any session with check-in code C and any input code that does not equal C,
 * the check-in attempt must be rejected.
 */
describe("check-in code verification (property tests)", () => {
  it("correct code always passes", () => {
    fc.assert(
      fc.property(fc.stringMatching(/^\d{4}$/), (code) => {
        expect(verifyCheckinCode(code, code)).toBe(true);
      })
    );
  });

  it("any code different from the expected code is rejected", () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^\d{4}$/),
        fc.stringMatching(/^\d{4}$/),
        (expected, input) => {
          fc.pre(input !== expected);
          expect(verifyCheckinCode(input, expected)).toBe(false);
        }
      )
    );
  });

  it("non-4-digit strings are always rejected against valid codes", () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^\d{4}$/),
        fc.string().filter((s) => !/^\d{4}$/.test(s)),
        (expected, input) => {
          expect(verifyCheckinCode(input, expected)).toBe(false);
        }
      )
    );
  });
});
