import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getVerifiedEmailFromCookie } from "@/db/auth-helper";
import { isAdminEmail } from "@/utils/admin-helper";

export async function GET() {
  try {
    const email = await getVerifiedEmailFromCookie("auth_session");

    if (!email || isAdminEmail(email)) {
      const response = NextResponse.json({ authenticated: false });
      const cookieStore = await cookies();
      cookieStore.delete("auth_session");
      return response;
    }

    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = userResult[0];

    if (!user) {
      const response = NextResponse.json({ authenticated: false });
      const cookieStore = await cookies();
      cookieStore.delete("auth_session");
      return response;
    }

    return NextResponse.json({ 
      authenticated: true, 
      user: {
        email: user.email,
        fullName: user.fullName,
      } 
    });
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
