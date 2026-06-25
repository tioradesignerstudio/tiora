import { db } from "./index";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Running migration to add filter_category column to products...");
  try {
    await db.run(sql.raw(`ALTER TABLE products ADD COLUMN filter_category TEXT`));
    console.log("Column filter_category added successfully.");
  } catch (e: any) {
    if (e.message && e.message.includes("duplicate column name")) {
      console.log("Column filter_category already exists.");
    } else {
      console.error("Migration failed:", e);
    }
  }
}

run();
