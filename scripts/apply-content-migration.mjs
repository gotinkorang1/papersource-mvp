import dotenv from "dotenv";
import postgres from "postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({ path: ".env.local" });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
try {
  await sql.file(path.join(root, "drizzle/0014_content_management.sql"));
  const rows = await sql`select table_name from information_schema.tables where table_schema = 'public' and table_name in ('content_pages', 'faqs', 'navigation_items') order by table_name`;
  if (rows.length !== 3) throw new Error("Content tables were not all created.");
  console.log("Content management migration applied and verified.");
} finally {
  await sql.end({ timeout: 5 });
}
