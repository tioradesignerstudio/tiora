import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, otpVerifications } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { isAdminEmail } from "@/utils/admin-helper";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Block admin email from user sign in
    if (isAdminEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "This email address is registered for administrator access only." },
        { status: 400 }
      );
    }

    // Find the latest OTP sent to this email
    const verifications = await db.select()
      .from(otpVerifications)
      .where(eq(otpVerifications.email, normalizedEmail))
      .orderBy(desc(otpVerifications.createdAt))
      .limit(1);

    if (verifications.length === 0) {
      return NextResponse.json(
        { success: false, error: "No verification code requested for this email" },
        { status: 400 }
      );
    }

    const verification = verifications[0];

    // Check if OTP matches
    if (verification.otp !== otp.trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check expiration
    const expiryTime = new Date(verification.expiresAt).getTime();
    if (Date.now() > expiryTime) {
      return NextResponse.json(
        { success: false, error: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    // Valid OTP! Proceed with user lookup and login
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    let user = userResult[0];
    let isNewUser = false;
    const isUserAdmin = isAdminEmail(normalizedEmail);

    if (!user) {
      // Register new user
      const inserted = await db.insert(users).values({
        email: normalizedEmail,
        role: isUserAdmin ? "admin" : "user",
        lastLoginAt: new Date().toISOString(),
      }).returning();
      user = inserted[0];
      isNewUser = true;
    } else {
      // Update last login and upgrade role if they became an admin
      await db.update(users)
        .set({
          lastLoginAt: new Date().toISOString(),
          role: isUserAdmin ? "admin" : user.role,
        })
        .where(eq(users.email, normalizedEmail));

      if (!user.fullName) {
        isNewUser = true;
      }
    }

    // Set cookie headers in Next.js
    const cookieStore = await cookies();
    cookieStore.set("auth_session", normalizedEmail, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    if (isUserAdmin || user.role === "admin") {
      cookieStore.set("admin_session", normalizedEmail, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    // Clean up used OTPs from the database
    await db.delete(otpVerifications).where(eq(otpVerifications.email, normalizedEmail));

    return NextResponse.json({
      success: true,
      isNewUser,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      }
    });
  } catch (error: any) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
