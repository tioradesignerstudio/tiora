import { verifyAdminRequest } from "@/utils/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { pageSections, navigationMenu, products } from "@/db/schema";
import { asc, eq, inArray } from "drizzle-orm";

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

async function syncSectionFilterCategories(menuId: number, productIdsStr: string) {
  if (!productIdsStr) return;
  const ids = productIdsStr.split(",")
    .map(id => parseInt(id.trim()))
    .filter(id => !isNaN(id));
  
  if (ids.length === 0) return;

  const sectionProducts = await db.select().from(products).where(inArray(products.id, ids));
  const filterCategories = sectionProducts
    .map(p => p.filterCategory?.trim())
    .filter((fc): fc is string => !!fc);

  if (filterCategories.length === 0) return;

  const nav = await db.select().from(navigationMenu).where(eq(navigationMenu.id, menuId)).limit(1);
  if (nav.length === 0) return;

  const navItem = nav[0];
  let currentFilters = navItem.filterTypes ? navItem.filterTypes.split(",").map(s => s.trim()).filter(Boolean) : [];
  let updated = false;

  for (const filterCat of filterCategories) {
    const lowercaseList = currentFilters.map(s => s.toLowerCase());
    if (!lowercaseList.includes(filterCat.toLowerCase())) {
      currentFilters.push(filterCat);
      updated = true;
    }
  }

  if (updated) {
    await db.update(navigationMenu)
      .set({ filterTypes: currentFilters.join(", ") })
      .where(eq(navigationMenu.id, menuId));
  }
}

export async function GET(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const menuId = parseInt(searchParams.get("menuId") || "0");
    
    if (!menuId) return NextResponse.json({ success: false, error: "Menu ID required" }, { status: 400 });

    const sections = await db.select()
      .from(pageSections)
      .where(eq(pageSections.menuId, menuId))
      .orderBy(asc(pageSections.displayOrder));
      
    return NextResponse.json({ success: true, data: sections });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch sections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await db.insert(pageSections).values({
      menuId: body.menuId,
      title: body.title || "New Carousel Section",
      productIds: body.productIds || "",
      displayOrder: body.displayOrder || 0,
    }).returning();
    
    if (result && result.length > 0 && body.productIds) {
      await syncSectionFilterCategories(body.menuId, body.productIds);
    }

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to create section" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    if (Array.isArray(body)) {
      // Bulk update (reordering)
      for (const item of body) {
        await db.update(pageSections)
          .set({ displayOrder: item.displayOrder })
          .where(eq(pageSections.id, item.id));
      }
      return NextResponse.json({ success: true });
    } else {
      const { id, ...updates } = body;
      const result = await db.update(pageSections)
        .set(updates)
        .where(eq(pageSections.id, id))
        .returning();

      if (result && result.length > 0) {
        await syncSectionFilterCategories(result[0].menuId, result[0].productIds);
      }

      return NextResponse.json({ success: true, data: result[0] });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update section" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!await isAdmin(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");
    
    await db.delete(pageSections).where(eq(pageSections.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete section" }, { status: 400 });
  }
}
