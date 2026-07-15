import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const url = process.env.DATABASE_URL || process.env.DATABASE_URI;
const authToken = process.env.DATABASE_AUTH_TOKEN;

const globalForDb = globalThis as unknown as {
  conn: ReturnType<typeof createClient> | undefined;
};

// Initialize the client based on the environment (reusing client across hot reloads)
const client = globalForDb.conn ?? (
  (url && url !== "file:sqlite.db")
    ? createClient({ url, authToken })
    : createClient({ url: "file:sqlite.db" }) // Local fallback
);

if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = client;
}

export const db = drizzle(client, { schema });
