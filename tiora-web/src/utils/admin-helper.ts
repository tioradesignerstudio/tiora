export function getAdminEmails(): string[] {
  const envVal = process.env.ADMIN_EMAIL || "admin@tiorastudio.com";
  return envVal
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  const normalizedInput = email.trim().toLowerCase();
  const adminEmails = getAdminEmails();
  return adminEmails.includes(normalizedInput);
}
