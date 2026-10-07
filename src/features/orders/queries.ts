import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { orderItems, orders, payments } from "@/lib/db/schema";
import { canAccessAdmin } from "@/lib/staff/rbac";
import type { StaffRole } from "@/lib/staff/types";

const orderSourceValues = ["cart", "quote"] as const;
const orderStatusValues = [
  "pending_payment",
  "awaiting_terms",
  "paid",
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export const ADMIN_ORDER_PAGE_SIZE = 50;

export class OrderAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderAdminError";
  }
}

export async function listAdminOrders(role: StaffRole, filters?: { search?: string; status?: string; source?: string; sort?: string; page?: string }) {
  if (!canAccessAdmin(role, "orders", "read")) {
    throw new OrderAdminError("This role cannot view orders.");
  }
  const db = getDb();
  const search = filters?.search?.trim();
  const where = and(
    search ? or(ilike(orders.number, `%${search}%`), ilike(orders.notes, `%${search}%`)) : undefined,
    filters?.status && orderStatusValues.includes(filters.status as (typeof orderStatusValues)[number]) ? eq(orders.status, filters.status as (typeof orderStatusValues)[number]) : undefined,
    filters?.source && orderSourceValues.includes(filters.source as (typeof orderSourceValues)[number]) ? eq(orders.source, filters.source as (typeof orderSourceValues)[number]) : undefined,
  );
  const order = filters?.sort === "total" ? desc(orders.grandTotal) : filters?.sort === "status" ? asc(orders.status) : desc(orders.updatedAt);
  const requestedPage = Number.parseInt(filters?.page ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const rows = await db
    .select({
      id: orders.id,
      number: orders.number,
      source: orders.source,
      status: orders.status,
      grandTotal: orders.grandTotal,
    })
    .from(orders)
    .where(where)
    .orderBy(order)
    .limit(ADMIN_ORDER_PAGE_SIZE + 1)
    .offset((page - 1) * ADMIN_ORDER_PAGE_SIZE);
  return { rows: rows.slice(0, ADMIN_ORDER_PAGE_SIZE), page, hasNext: rows.length > ADMIN_ORDER_PAGE_SIZE };
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
  const [lines, paymentRows] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    db.select({ id: payments.id, provider: payments.provider, status: payments.status, amount: payments.amount, reference: payments.paystackReference, createdAt: payments.createdAt }).from(payments).where(eq(payments.orderId, order.id)).orderBy(desc(payments.createdAt)),
  ]);
  return { ...order, lines, payments: paymentRows };
}
