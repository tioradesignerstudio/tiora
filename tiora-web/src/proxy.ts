import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminEmail } from "./utils/admin-helper";

/**
 * Validates the session cookie value. Supports simple email address matching.
 */
function verifySession(token: string | undefined): { email: string } | null {
  if (!token) return null;

  // Verify email format (must contain '@')
  if (token.includes("@")) {
    return { email: token.trim().toLowerCase() };
  }

  return null;
}

export function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get("auth_session")?.value;
  const adminSessionCookie = request.cookies.get("admin_session")?.value;
  const { pathname } = request.nextUrl;

  let userSession = verifySession(sessionCookie);
  if (userSession && isAdminEmail(userSession.email)) {
    userSession = null;
  }
  const adminSession = verifySession(adminSessionCookie);

  console.log(`[Middleware Debug] Path: ${pathname}, auth_session: ${sessionCookie} (valid: ${!!userSession}), admin_session: ${adminSessionCookie} (valid: ${!!adminSession})`);

  // 1. If user is logged in, don't let them go to the login page
  if (userSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. Protect Admin Routes (The Firewall)
  if (pathname.startsWith("/admin")) {
    // Exclude the login and denied pages from protection to avoid redirect loops
    if (pathname === "/admin/login" || pathname === "/admin/denied") {
      // If already logged in as admin, don't show login page
      if (pathname === "/admin/login" && adminSession?.email && isAdminEmail(adminSession.email)) {
        return NextResponse.redirect(new URL("/admin/navigation", request.url));
      }
      return NextResponse.next();
    }

    if (!adminSessionCookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Strict Admin Identity Check
    if (!adminSession || !isAdminEmail(adminSession.email)) {
      console.warn(`[Security] Unauthorized admin access attempt`);
      return NextResponse.redirect(new URL("/admin/denied", request.url));
    }
  }

  // 3. Protect Product and Cart Routes 
  if ((pathname.startsWith("/product/") || pathname.startsWith("/cart")) && !userSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
    "/cart/:path*",
    "/product/:path*",
  ],
};
