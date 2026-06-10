import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { adminAuth } from "@/db/firebase-admin";
import { isAdminPhone } from "@/utils/admin-helper";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone: rawPhone, idToken } = body;

    let phone = rawPhone;
    let verifiedToken = idToken;

    if (idToken) {
      // 1. Firebase Token Verification
      try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        const firebasePhone = decoded.phone_number;
        if (!firebasePhone) {
          return NextResponse.json(
            { success: false, error: "Phone number missing in verified token" },
            { status: 400 }
          );
        }
        // Normalize the verified phone number by stripping country code (+91)
        phone = firebasePhone.replace(/^\+91/, "").replace(/\D/g, "");

        // Create a Firebase Session Cookie using the verified ID token
        // Session duration: 5 days (in milliseconds)
        const expiresIn = 1000 * 60 * 60 * 24 * 5;
        verifiedToken = await adminAuth.createSessionCookie(idToken, { expiresIn });
      } catch (err: any) {
        console.error("Firebase ID Token verification failed during sync:", err.message);
        return NextResponse.json(
          { success: false, error: "Invalid or expired session token" },
          { status: 401 }
        );
      }
    } else {
      // 2. Local Mock Fallback for testing/development
      if (!phone) {
        return NextResponse.json(
          { success: false, error: "Invalid parameters" },
          { status: 400 }
        );
      }
      // For local testing, use the plaintext phone directly as the token
      verifiedToken = phone;
    }

    let user = null;
    let isNewUser = false;

    const userResult = await db.select()
      .from(users)
      .where(eq(users.phoneNumber, phone))
      .limit(1);
    
    user = userResult[0];

    const isUserAdmin = isAdminPhone(phone);

    if (!user) {
      // Register new user automatically if not found
      await db.insert(users).values({
        phoneNumber: phone,
        role: isUserAdmin ? "admin" : "user",
        lastLoginAt: new Date().toISOString(),
      });
      isNewUser = true;
    } else {
      // Update lastLoginAt and upgrade role to admin if matching admin whitelist
      await db.update(users)
        .set({ 
          lastLoginAt: new Date().toISOString(),
          ...(isUserAdmin && user.role !== "admin" ? { role: "admin" } : {})
        })
        .where(eq(users.phoneNumber, phone));
      
      if (!user.fullName) {
        isNewUser = true;
      }
    }

    const cookieName = isUserAdmin ? "admin_session" : "auth_session";
    const response = NextResponse.json({ 
      success: true, 
      isNewUser, 
      message: isNewUser ? "Welcome! Please tell us your name." : "Welcome back!" 
    });

    // Set maxAge matching the 5 days session cookie duration (or 30 days for mock phone token)
    const maxAge = idToken ? 60 * 60 * 24 * 5 : 60 * 60 * 24 * 30;

    response.cookies.set(cookieName, verifiedToken, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return response;

  } catch (error: any) {
    console.error(`Sync API Error:`, error);
    return NextResponse.json({ 
      success: false, 
      error: "A server error occurred during sync." 
    }, { status: 500 });
  }
}
