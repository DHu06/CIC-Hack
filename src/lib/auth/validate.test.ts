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
