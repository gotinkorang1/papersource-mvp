import "server-only";
import { desc, eq, inArray, or } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { orders, organizationMembers, quotes } from "@/lib/db/schema";

export async function listCustomerOrders(profileId: string) {
  const db = getDb();
  return db
    .select({
      id: orders.id,
      number: orders.number,
      status: orders.status,
      grandTotal: orders.grandTotal,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(or(eq(orders.profileId, profileId), inArray(orders.organizationId, db.select({ id: organizationMembers.organizationId }).from(organizationMembers).where(eq(organizationMembers.profileId, profileId)))))
    .orderBy(desc(orders.createdAt));
}

export async function listCustomerQuotes(profileId: string) {
  const db = getDb();
  return db
    .select({
      id: quotes.id,
      number: quotes.number,
      status: quotes.status,
      grandTotal: quotes.grandTotal,
      createdAt: quotes.createdAt,
    })
    .from(quotes)
    .where(or(eq(quotes.profileId, profileId), inArray(quotes.organizationId, db.select({ id: organizationMembers.organizationId }).from(organizationMembers).where(eq(organizationMembers.profileId, profileId)))))
    .orderBy(desc(quotes.updatedAt));
}
