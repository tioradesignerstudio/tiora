import { db } from "../src/db";
import { orders, users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const allOrders = await db.select({
    id: orders.id,
    userId: orders.userId,
    shippingAddress: orders.shippingAddress,
    totalAmount: orders.totalAmount,
  }).from(orders);

  console.log("Orders in Database:");
  for (const o of allOrders) {
    const user = await db.select().from(users).where(eq(users.id, o.userId || 0)).limit(1);
    console.log(`- Order ID: ${o.id} | User ID: ${o.userId} | User Email: "${user[0]?.email || 'N/A'}" | Total: ${o.totalAmount} | Shipping Name: "${o.shippingAddress?.match(/Name:\s*([^,]+)/)?.[1]?.trim() || 'N/A'}"`);
  }
}

main().catch(console.error);
