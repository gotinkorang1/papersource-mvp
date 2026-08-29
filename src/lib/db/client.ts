import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let client: ReturnType<typeof postgres> | undefined;

export function getDb() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Use a local or staging Supabase project — never production from this scaffold.",
    );
  }

  if (!client) {
    client = postgres(url, { prepare: false });
  }

  return drizzle(client);
}
