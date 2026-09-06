import dotenv from "dotenv";
import postgres from "postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
try {
  await sql.file(path.join(root, "drizzle/0013_product_reviews.sql"));
  console.log("Product reviews migration applied and verified.");
} finally {
  await sql.end({ timeout: 5 });
}
