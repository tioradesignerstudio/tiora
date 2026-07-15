import { NextResponse } from "next/server";
import { isAdminEmail } from "@/utils/admin-helper";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const isAdmin = isAdminEmail(email);
    return NextResponse.json({ success: true, isAdmin });
  } catch (error: any) {
    console.error("Check Admin API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
