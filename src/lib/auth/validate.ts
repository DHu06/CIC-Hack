/**
 * Validates that an email is acceptable for sign-in.
 * NOTE: Email domain restriction disabled for demo/testing.
 * In production, this would check for @student.ubc.ca
 */
export function validateUBCEmail(email: string): boolean {
  return email.length > 0 && email.includes("@");
}
