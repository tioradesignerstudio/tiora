import { verifyAdminRequest } from "@/utils/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { servicePackages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

async function isAdmin(request: Request) {
  return !!(await verifyAdminRequest(request));
}

export async function GET(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await db
      .select()
      .from(servicePackages)
      .orderBy(asc(servicePackages.order));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Admin Fetch Packages Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.categoryTitle || !body.tierName || !body.price || !body.whatsappMsg) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const featuresString = Array.isArray(body.features) 
      ? JSON.stringify(body.features) 
      : body.features || JSON.stringify([]);

    const result = await db.insert(servicePackages).values({
      categoryTitle: body.categoryTitle,
      categoryTagline: body.categoryTagline || "",
      categoryBgImage: body.categoryBgImage || "/images/bridal_styling_pkg.png",
      categoryIcon: body.categoryIcon || "Crown",
      categoryThemeColor: body.categoryThemeColor || "#C5A059",
      tierName: body.tierName,
      price: body.price,
      features: featuresString,
      upgradeBenefit: body.upgradeBenefit || null,
      whatsappMsg: body.whatsappMsg,
      order: body.order || 0,
    }).returning();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error("Admin Create Package Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create package", devDetails: error?.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Package ID is required" }, { status: 400 });
    }

    // Format features if provided as array
    if (updates.features !== undefined && Array.isArray(updates.features)) {
      updates.features = JSON.stringify(updates.features);
    }

    const result = await db
      .update(servicePackages)
      .set(updates)
      .where(eq(servicePackages.id, Number(id)))
      .returning();

    if (result.length > 0) {
      return NextResponse.json({ success: true, data: result[0] });
    }
    return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 });
  } catch (error: any) {
    console.error("Admin Update Package Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update package", devDetails: error?.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Package ID is required" }, { status: 400 });
    }

    await db.delete(servicePackages).where(eq(servicePackages.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin Delete Package Error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete package", devDetails: error?.message }, { status: 500 });
  }
}
