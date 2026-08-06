import { describe, it, expect } from "vitest";
import { validateUBCEmail } from "./validate";

describe("validateUBCEmail", () => {
  it("returns true for any email with an @ sign", () => {
    expect(validateUBCEmail("john@student.ubc.ca")).toBe(true);
    expect(validateUBCEmail("user@gmail.com")).toBe(true);
    expect(validateUBCEmail("test@example.org")).toBe(true);
  });

  it("returns true regardless of domain", () => {
    expect(validateUBCEmail("JANE@STUDENT.UBC.CA")).toBe(true);
    expect(validateUBCEmail("user@hotmail.com")).toBe(true);
    expect(validateUBCEmail("dev@company.io")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(validateUBCEmail("")).toBe(false);
  });

  it("returns false for string without @", () => {
    expect(validateUBCEmail("noatsign")).toBe(false);
    expect(validateUBCEmail("just a string")).toBe(false);
  });
});

import * as fc from "fast-check";

/**
 * Property-based tests for email validation (domain restriction disabled)
 * **Validates: Requirements 1.1, 1.2**
 */
describe("validateUBCEmail - property-based tests", () => {
  it("returns true for any non-empty string containing @", () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        (email) => {
          expect(validateUBCEmail(email)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns false for any string without @", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter((s) => !s.includes("@")),
        (str) => {
          expect(validateUBCEmail(str)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns false for empty string", () => {
    expect(validateUBCEmail("")).toBe(false);
  });
});
