import dotenv from "dotenv";
import path from "path";

// Load local .env variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

console.log("Loaded env. PROJECT_ID:", process.env.FIREBASE_PROJECT_ID);

try {
  // Dynamically import the firebase-admin file
  const { adminAuth } = require("../src/db/firebase-admin");
  console.log("Firebase Admin successfully imported!");
  console.log("adminAuth is null?", adminAuth === null);
} catch (error: any) {
  console.error("Firebase Admin Import/Init Failed:", error);
}
