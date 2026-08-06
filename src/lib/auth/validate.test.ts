import { describe, it, expect } from "vitest";
import { validateUBCEmail } from "./validate";

describe("validateUBCEmail", () => {
  it("returns true for valid @student.ubc.ca email", () => {
    expect(validateUBCEmail("john@student.ubc.ca")).toBe(true);
  });

  it("returns true regardless of case", () => {
    expect(validateUBCEmail("JANE@STUDENT.UBC.CA")).toBe(true);
    expect(validateUBCEmail("Test@Student.Ubc.Ca")).toBe(true);
  });

  it("returns false for non-UBC email", () => {
    expect(validateUBCEmail("user@gmail.com")).toBe(false);
  });

  it("returns false for partial domain match", () => {
    expect(validateUBCEmail("user@notstudent.ubc.ca")).toBe(false);
    expect(validateUBCEmail("user@ubc.ca")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(validateUBCEmail("")).toBe(false);
  });

  it("returns false for email with extra suffix", () => {
    expect(validateUBCEmail("user@student.ubc.ca.fake")).toBe(false);
  });
});

import * as fc from "fast-check";

/**
 * Property-based tests for email validation
 * **Validates: Requirements 1.1, 1.2**
 */
describe("validateUBCEmail - property-based tests", () => {
  it("returns true for any string ending with @student.ubc.ca", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).map((s) => s.replace(/@/g, "") + "@student.ubc.ca"),
        (email) => {
          expect(validateUBCEmail(email)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns false for any string NOT ending with @student.ubc.ca", () => {
    fc.assert(
      fc.property(
        fc.string().filter(
          (s) => !s.toLowerCase().endsWith("@student.ubc.ca")
        ),
        (email) => {
          expect(validateUBCEmail(email)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("is case-insensitive on the domain part", () => {
    const domainVariants = [
      "@STUDENT.UBC.CA",
      "@Student.Ubc.Ca",
      "@student.UBC.ca",
      "@STUDENT.ubc.CA",
      "@Student.UBC.Ca",
    ];

    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).map((s) => s.replace(/@/g, "")),
        fc.constantFrom(...domainVariants),
        (local, domain) => {
          expect(validateUBCEmail(local + domain)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns false for empty string", () => {
    expect(validateUBCEmail("")).toBe(false);
  });

  it("returns false for any random email with a different domain", () => {
    fc.assert(
      fc.property(
        fc.emailAddress().filter(
          (email) => !email.toLowerCase().endsWith("@student.ubc.ca")
        ),
        (email) => {
          expect(validateUBCEmail(email)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
