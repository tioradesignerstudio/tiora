import { NextResponse } from "next/server";
import { db } from "@/db";
import { cartItems, users, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getVerifiedEmailFromCookie } from "@/db/auth-helper";

export async function POST(request: Request) {
  try {
    const email = await getVerifiedEmailFromCookie("auth_session");

    if (!email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = userResult[0];

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const { items } = await request.json();

    // Simple sync logic: replace DB cart with local cart or merge.
    // For now, let's just clear and replace to keep it simple as a first step.
    await db.delete(cartItems).where(eq(cartItems.userId, user.id));

    if (items && items.length > 0) {
      const dbItems = items.map((item: any) => ({
        userId: user.id,
        productId: item.productId,
        baseSize: item.size,
        customSpecifications: item.customizations,
        itemHash: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      await db.insert(cartItems).values(dbItems);
    }

    return NextResponse.json({ success: true, message: "Cart synced successfully" });
  } catch (error: any) {
    console.error("Cart Sync Error:", error);
    return NextResponse.json({ success: false, error: "Failed to sync cart" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const email = await getVerifiedEmailFromCookie("auth_session");

    if (!email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = userResult[0];

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Fetch and join products to get name and image for frontend
    const dbCart = await db.select({
      id: cartItems.itemHash,
      productId: cartItems.productId,
      name: products.name,
      price: cartItems.price,
      images: products.images,
      colors: products.colors,
      quantity: cartItems.quantity,
      size: cartItems.baseSize,
      customizations: cartItems.customSpecifications,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, user.id));

    // Resolve the first image URL
    const { getFirstProductImageUrl } = await import("@/utils/product");
    const hydratedCart = dbCart.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: getFirstProductImageUrl(item.images, item.colors) || "/images/placeholder.png",
      quantity: item.quantity,
      size: item.size,
      customizations: item.customizations,
    }));

    return NextResponse.json({ success: true, items: hydratedCart });
  } catch (error: any) {
    console.error("Cart Fetch Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch cart" }, { status: 500 });
  }
}
