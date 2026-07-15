import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const configAdminEmail = (process.env.ADMIN_EMAIL || "admin@tiorastudio.com").trim().toLowerCase();
    const configAdminPassword = process.env.ADMIN_PASSWORD || "tiora@27";

    if (normalizedEmail !== configAdminEmail || password !== configAdminPassword) {
      return NextResponse.json({ success: false, error: "Invalid admin credentials" }, { status: 401 });
    }

    // 1. Find or create user in users table
    const userResult = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    let user = userResult[0];

    if (!user) {
      const inserted = await db.insert(users).values({
        email: normalizedEmail,
        fullName: "System Admin",
        role: "admin",
        lastLoginAt: new Date().toISOString(),
      }).returning();
      user = inserted[0];
    } else {
      await db.update(users)
        .set({
          role: "admin", // Ensure they are admin
          lastLoginAt: new Date().toISOString(),
        })
        .where(eq(users.email, normalizedEmail));
    }

    // 2. Set cookies
    const cookieStore = await cookies();
    cookieStore.set("admin_session", normalizedEmail, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });



    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Login Route Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Login failed" }, { status: 500 });
  }
}
