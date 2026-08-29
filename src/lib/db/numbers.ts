import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { documentCounters } from "@/lib/db/schema";

export async function nextDocumentNumber(kind: "order" | "quote") {
  const year = new Date().getUTCFullYear();
  const prefix = kind === "order" ? "PSO" : "PSQ";
  const db = getDb();

  const [row] = await db
    .insert(documentCounters)
    .values({ kind, year, value: 1 })
    .onConflictDoUpdate({
      target: [documentCounters.kind, documentCounters.year],
      set: { value: sql`${documentCounters.value} + 1` },
    })
    .returning();

  if (!row) {
    const [existing] = await db
      .select()
      .from(documentCounters)
      .where(
        and(eq(documentCounters.kind, kind), eq(documentCounters.year, year)),
      )
      .limit(1);
    if (!existing) {
      throw new Error("Could not allocate a document number.");
    }
    return `${prefix}-${year}-${String(existing.value).padStart(6, "0")}`;
  }

  return `${prefix}-${year}-${String(row.value).padStart(6, "0")}`;
}
