import { db } from "@/db";
import { servicePackages } from "@/db/schema";
import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await db
      .select()
      .from(servicePackages)
      .orderBy(asc(servicePackages.order));
      
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching service packages:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
