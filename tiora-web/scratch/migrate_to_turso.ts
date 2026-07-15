import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

// Load active env file
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const tursoUrl = process.env.DATABASE_URL;
const tursoToken = process.env.DATABASE_AUTH_TOKEN;

if (!tursoUrl || tursoUrl.startsWith("file:")) {
  console.error("Error: DATABASE_URL is not set to a Turso database in .env.local");
  process.exit(1);
}

console.log("Connecting to local SQLite database...");
const localDb = new Database("sqlite.db");

console.log(`Connecting to remote Turso database: ${tursoUrl}...`);
const tursoClient = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

// List of all tables to migrate (ordered to minimize foreign key constraints issues)
const tables = [
  "users",
  "otp_verifications",
  "products",
  "product_variations",
  "product_customisation_rules",
  "cart_items",
  "navigation_menu",
  "page_sections",
  "orders",
  "coupons",
  "order_items",
  "site_settings",
  "offer_banners",
  "homepage_categories",
  "wishlists",
  "service_packages"
];

async function run() {
  try {
    console.log("Truncating remote tables on Turso...");
    // Truncate in reverse order of tables to respect dependencies
    for (const table of [...tables].reverse()) {
      console.log(`Clearing table: ${table}...`);
      await tursoClient.execute(`DELETE FROM "${table}"`);
    }

    console.log("Beginning data migration...");
    for (const table of tables) {
      console.log(`\n----------------------------------------------`);
      console.log(`Migrating table: ${table}...`);

      // 1. Get columns that exist in the remote Turso table
      const pragmaResult = await tursoClient.execute(`PRAGMA table_info("${table}")`);
      const remoteColumns = pragmaResult.rows.map(row => String(row.name));
      console.log(`Remote columns in "${table}":`, remoteColumns);

      if (remoteColumns.length === 0) {
        console.warn(`Warning: Could not get table info for "${table}" on Turso. Skipping.`);
        continue;
      }

      // 2. Read only matching columns from local SQLite
      const selectColumnsCsv = remoteColumns.map(col => `"${col}"`).join(", ");
      const rows = localDb.prepare(`SELECT ${selectColumnsCsv} FROM "${table}"`).all() as Record<string, any>[];
      console.log(`Found ${rows.length} rows to migrate for "${table}"`);

      if (rows.length === 0) continue;

      // 3. Prepare insert query for matching columns
      const insertColumnsCsv = remoteColumns.map(col => `"${col}"`).join(", ");
      const placeholders = remoteColumns.map(() => "?").join(", ");
      const insertQuery = `INSERT INTO "${table}" (${insertColumnsCsv}) VALUES (${placeholders})`;

      // 4. Insert in batches of 50
      const batchSize = 50;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        
        // Execute batch transaction on Turso
        const statements = batch.map(row => {
          const values = remoteColumns.map(col => {
            const val = row[col];
            // Handle boolean or objects
            if (val !== null && typeof val === "object") {
              return JSON.stringify(val);
            }
            return val;
          });
          return {
            sql: insertQuery,
            args: values,
          };
        });

        await tursoClient.batch(statements);
      }

      console.log(`Successfully migrated ${rows.length} rows to "${table}" on Turso!`);
    }

    console.log("\n==============================================");
    console.log("Data migration complete! All products, categories, users, orders, and packages are restored to Turso!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    localDb.close();
    process.exit(0);
  }
}

run();
