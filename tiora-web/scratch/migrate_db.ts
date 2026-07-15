import Database from "better-sqlite3";
import * as path from "path";
import * as fs from "fs";

const projectRoot = "c:/Users/vedab/Downloads/tiora/tiora-web";
const dbPaths = [
  path.join(projectRoot, "sqlite.db"),
  path.join(projectRoot, "local.db")
];

for (const dbPath of dbPaths) {
  if (!fs.existsSync(dbPath)) {
    console.log(`DB file not found: ${dbPath}`);
    continue;
  }

  console.log(`Checking database: ${dbPath}`);
  const db = new Database(dbPath);

  try {
    // 1. Migrate users table
    const usersInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
    const hasPhone = usersInfo.some(col => col.name === "phone_number");
    const hasEmail = usersInfo.some(col => col.name === "email");

    if (hasPhone && !hasEmail) {
      console.log(`Renaming phone_number to email in users table for ${dbPath}...`);
      db.prepare("ALTER TABLE users RENAME COLUMN phone_number TO email").run();
      console.log("Success!");
    } else {
      console.log(`users table already migrated or no phone_number column found in ${dbPath}.`);
    }

    // 2. Migrate otp_verifications table
    const otpInfo = db.prepare("PRAGMA table_info(otp_verifications)").all() as any[];
    const hasPhoneOtp = otpInfo.some(col => col.name === "phone_number");
    const hasEmailOtp = otpInfo.some(col => col.name === "email");

    if (hasPhoneOtp && !hasEmailOtp) {
      console.log(`Renaming phone_number to email in otp_verifications table for ${dbPath}...`);
      db.prepare("ALTER TABLE otp_verifications RENAME COLUMN phone_number TO email").run();
      console.log("Success!");
    } else {
      console.log(`otp_verifications table already migrated or no phone_number column found in ${dbPath}.`);
    }

  } catch (err) {
    console.error(`Failed to migrate ${dbPath}:`, err);
  } finally {
    db.close();
  }
}
console.log("Migration check completed.");
