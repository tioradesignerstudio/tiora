/**
 * Utility for parsing and validating administrative phone numbers.
 * Supports up to 5 comma-separated admin phone numbers from environment variables.
 */

export function getAdminPhones(): string[] {
  const envVal = process.env.ADMIN_PHONE_NUMBER || "9999999999";
  return envVal
    .split(",")
    .map((num) => num.replace(/\D/g, "").slice(-10)) // Normalizes to 10 digits
    .filter((num) => num.length === 10)
    .slice(0, 5); // Ignore everything after the first 5 numbers
}

export function isAdminPhone(phone: string): boolean {
  if (!phone) return false;
  // Normalize the input phone number (strip country prefix +91 and non-digits, take last 10 digits)
  const normalizedInput = phone.replace(/^\+91/, "").replace(/\D/g, "").slice(-10);
  const adminPhones = getAdminPhones();
  return adminPhones.includes(normalizedInput);
}
