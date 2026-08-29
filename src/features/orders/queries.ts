import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { orderItems, orders } from "@/lib/db/schema";
import { canAccessAdmin } from "@/lib/staff/rbac";
import type { StaffRole } from "@/lib/staff/types";

export class OrderAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderAdminError";
  }
}

export async function listAdminOrders(role: StaffRole) {
  if (!canAccessAdmin(role, "orders", "read")) {
    throw new OrderAdminError("This role cannot view orders.");
  }
  const db = getDb();
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getAdminOrder(role: StaffRole, orderId: string) {
  if (!canAccessAdmin(role, "orders", "read")) {
    throw new OrderAdminError("This role cannot view orders.");
  }
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    return null;
  }
  const lines = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));
  return { ...order, lines };
}
