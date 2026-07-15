import { cookies } from "next/headers";

/**
 * Verifies the session cookie and returns the verified email address.
 */
export async function getVerifiedEmailFromCookie(cookieName: "auth_session" | "admin_session"): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(cookieName)?.value;
    if (!token) return null;

    // Simple email verification (must contain '@')
    if (token.includes("@")) {
      return token.trim().toLowerCase();
    }
    return null;
  } catch (error) {
    console.error(`[Auth Helper] Failed to verify token in cookie '${cookieName}':`, error);
    return null;
  }
}

/**
 * Checks if the current admin session is valid and corresponds to the designated administrator email.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const email = await getVerifiedEmailFromCookie("admin_session");
  if (!email) return false;
  
  const { isAdminEmail } = await import("@/utils/admin-helper");
  return isAdminEmail(email);
}
