import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | undefined;
let db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getDb() {
  const url = process.env.DATABASE_URL;

  const connectionString = url?.trim();
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Use the dedicated PaperSource Postgres from docker compose — never another project database.",
    );
  }

  try {
    const parsed = new URL(connectionString);
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !parsed.hostname) throw new Error();
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection string (postgresql://...).");
  }

  if (!db) {
    client = postgres(connectionString, { prepare: false, max: 10 });
    db = drizzle(client, { schema });
  }

  return db;
}

export async function closeDb() {
  if (client) {
    await client.end({ timeout: 5 });
    client = undefined;
    db = undefined;
  }
}
