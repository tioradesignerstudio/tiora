import { cookies } from "next/headers";
import { isAdminEmail } from "@/utils/admin-helper";

export interface DecodedAdminToken {
  uid: string;
  email?: string;
  [key: string]: any;
}

/**
 * Verifies if the request is authenticated as an authorized administrator.
 * Checks the Authorization header (Bearer token) or the admin_session cookie.
 */
export async function verifyAdminRequest(request?: Request): Promise<DecodedAdminToken | null> {
  try {
    let token: string | undefined;

    // 1. Try to get token from Authorization header if request is provided
    if (request) {
      const authHeader = request.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split("Bearer ")[1];
      }
    }

    // 2. Try to get token from cookies (admin_session)
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get("admin_session")?.value;
    }

    if (!token) {
      return null;
    }

    const email = token.trim().toLowerCase();
    
    // Check if the token is a valid email address and is whitelisted as admin
    if (email.includes("@") && isAdminEmail(email)) {
      return {
        uid: "admin-uid",
        email: email,
      };
    }

    console.warn(`[Security] Unauthorized admin access attempt from: ${token}`);
    return null;
  } catch (error) {
    console.error("[Auth Utility] verifyAdminRequest error:", error);
    return null;
  }
}
