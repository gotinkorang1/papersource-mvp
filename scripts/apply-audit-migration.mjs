import { readFile } from "node:fs/promises";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Set it only for this command; it is never logged.");
}
if (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://")) {
  throw new Error("DATABASE_URL must be a PostgreSQL connection string from Supabase Connect (postgresql://...), not the project HTTPS URL.");
}

const sql = postgres(databaseUrl, { prepare: false, max: 1 });
try {
  const migration = await readFile(new URL("../drizzle/0011_audit_logs.sql", import.meta.url), "utf8");
  await sql.unsafe(migration);
  await sql`select 1 from audit_logs limit 1`;
  console.log("Audit logs migration applied and verified.");
} finally {
  await sql.end({ timeout: 5 });
}
