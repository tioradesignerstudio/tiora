import { db } from "../src/db";
import { users } from "../src/db/schema";

async function main() {
  const allUsers = await db.select().from(users);
  console.log("Database Users Details:");
  for (const u of allUsers) {
    console.log(`- ID: ${u.id} | Email: "${u.email}" | Name: "${u.fullName}" | Role: "${u.role}"`);
  }
}

main().catch(console.error);
