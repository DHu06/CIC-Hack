/**
 * Validates that an email address belongs to the UBC student domain.
 *
 * @param email - The email address to validate
 * @returns true if the email ends with @student.ubc.ca (case-insensitive)
 */
export function validateUBCEmail(email: string): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith("@student.ubc.ca");
}
