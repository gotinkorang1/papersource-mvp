import { and, asc, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { addresses, adminRoles, auditLogs, organizationMembers, organizations, payments, orders, profiles, quotes, deliveryZones } from "@/lib/db/schema";
import { canAccessAdmin } from "@/lib/staff/rbac";
import type { StaffRole } from "@/lib/staff/types";

export class AdminReadError extends Error {}

function assertRead(role: StaffRole, area: "customers" | "organisations" | "payments" | "deliveries") {
  if (!canAccessAdmin(role, area, "read")) throw new AdminReadError("This role cannot view that desk.");
}

export async function listAdminCustomers(role: StaffRole, search?: string) {
  assertRead(role, "customers");
  const query = search?.trim();
  return getDb().select({ id: profiles.id, email: profiles.email, fullName: profiles.fullName, phone: profiles.phone, updatedAt: profiles.updatedAt })
    .from(profiles).leftJoin(adminRoles, eq(adminRoles.profileId, profiles.id)).where(and(isNull(adminRoles.profileId), query ? or(ilike(profiles.fullName, `%${query}%`), ilike(profiles.email, `%${query}%`), ilike(profiles.phone, `%${query}%`)) : undefined)).orderBy(desc(profiles.updatedAt));
}

export async function listAdminOrganisations(role: StaffRole, search?: string) {
  assertRead(role, "organisations");
  const query = search?.trim();
  return getDb().select({ id: organizations.id, name: organizations.name, type: organizations.type, email: organizations.email, phone: organizations.phone, memberCount: sql<number>`count(${organizationMembers.id})::int`, updatedAt: organizations.updatedAt })
    .from(organizations).leftJoin(organizationMembers, eq(organizationMembers.organizationId, organizations.id)).where(query ? or(ilike(organizations.name, `%${query}%`), ilike(organizations.email, `%${query}%`), ilike(organizations.phone, `%${query}%`)) : undefined).groupBy(organizations.id).orderBy(desc(organizations.updatedAt));
}

export async function listAdminPayments(role: StaffRole, filters: { search?: string; status?: string; provider?: string; sort?: string } = {}) {
  assertRead(role, "payments");
  const query = filters.search?.trim();
  const statuses = ["initialized", "pending", "success", "failed", "abandoned"] as const;
  const providers = ["paystack", "bank_transfer", "purchase_order", "invoice_terms"] as const;
  const where = and(query ? or(ilike(orders.number, `%${query}%`), ilike(payments.paystackReference, `%${query}%`), ilike(profiles.email, `%${query}%`)) : undefined, filters.status && statuses.includes(filters.status as (typeof statuses)[number]) ? eq(payments.status, filters.status as (typeof statuses)[number]) : undefined, filters.provider && providers.includes(filters.provider as (typeof providers)[number]) ? eq(payments.provider, filters.provider as (typeof providers)[number]) : undefined);
  const order = filters.sort === "amount" ? desc(payments.amount) : asc(payments.createdAt);
  return getDb().select({ id: payments.id, provider: payments.provider, status: payments.status, amount: payments.amount, currency: payments.currency, reference: payments.paystackReference, orderNumber: orders.number, customerEmail: profiles.email, createdAt: payments.createdAt })
    .from(payments).innerJoin(orders, eq(orders.id, payments.orderId)).leftJoin(profiles, eq(profiles.id, orders.profileId)).where(where).orderBy(order);
}

export async function listAdminDeliveries(role: StaffRole, filters: { search?: string; status?: string; sort?: string } = {}) {
  assertRead(role, "deliveries");
  const query = filters.search?.trim();
  const statuses = ["pending_payment", "awaiting_terms", "paid", "processing", "out_for_delivery", "delivered", "cancelled"] as const;
  const where = and(query ? or(ilike(orders.number, `%${query}%`), ilike(profiles.email, `%${query}%`), ilike(deliveryZones.name, `%${query}%`)) : undefined, filters.status && statuses.includes(filters.status as (typeof statuses)[number]) ? eq(orders.status, filters.status as (typeof statuses)[number]) : undefined);
  const order = filters.sort === "status" ? asc(orders.status) : desc(orders.updatedAt);
  return getDb().select({ id: orders.id, number: orders.number, status: orders.status, source: orders.source, grandTotal: orders.grandTotal, zoneName: deliveryZones.name, zoneRegion: deliveryZones.region, customerEmail: profiles.email, updatedAt: orders.updatedAt })
    .from(orders).innerJoin(deliveryZones, eq(deliveryZones.id, orders.deliveryZoneId)).leftJoin(profiles, eq(profiles.id, orders.profileId)).where(where).orderBy(order);
}

export async function listAdminStaff(role: StaffRole) {
  if (!canAccessAdmin(role, "users", "read")) {
    throw new AdminReadError("This role cannot view staff users.");
  }

  return getDb()
    .select({
      id: profiles.id,
      email: profiles.email,
      fullName: profiles.fullName,
      phone: profiles.phone,
      role: adminRoles.role,
      updatedAt: profiles.updatedAt,
    })
    .from(profiles)
    .innerJoin(adminRoles, eq(adminRoles.profileId, profiles.id))
    .orderBy(asc(profiles.fullName), asc(profiles.email));
}

export async function getAdminCustomer(role: StaffRole, profileId: string) {
  assertRead(role, "customers");
  const db = getDb();
  const [profile] = await db
    .select({ id: profiles.id, email: profiles.email, fullName: profiles.fullName, phone: profiles.phone, updatedAt: profiles.updatedAt })
    .from(profiles)
    .leftJoin(adminRoles, eq(adminRoles.profileId, profiles.id))
    .where(sql`${profiles.id} = ${profileId} and ${adminRoles.profileId} is null`)
    .limit(1);
  if (!profile) return null;
  const [customerAddresses, customerOrders, customerQuotes] = await Promise.all([
    db.select().from(addresses).where(eq(addresses.ownerProfileId, profileId)).orderBy(desc(addresses.updatedAt)),
    db.select({ id: orders.id, number: orders.number, status: orders.status, grandTotal: orders.grandTotal, createdAt: orders.createdAt }).from(orders).where(eq(orders.profileId, profileId)).orderBy(desc(orders.createdAt)).limit(20),
    db.select({ id: quotes.id, number: quotes.number, status: quotes.status, grandTotal: quotes.grandTotal, createdAt: quotes.createdAt }).from(quotes).where(eq(quotes.profileId, profileId)).orderBy(desc(quotes.createdAt)).limit(20),
  ]);
  return { ...profile, addresses: customerAddresses, orders: customerOrders, quotes: customerQuotes };
}

export async function getAdminOrganisation(role: StaffRole, organisationId: string) {
  assertRead(role, "organisations");
  const db = getDb();
  const [organisation] = await db.select({ id: organizations.id, name: organizations.name, type: organizations.type, email: organizations.email, phone: organizations.phone, updatedAt: organizations.updatedAt })
    .from(organizations).where(eq(organizations.id, organisationId)).limit(1);
  if (!organisation) return null;
  const [members, organisationAddresses, organisationOrders, organisationQuotes] = await Promise.all([
    db.select({ id: organizationMembers.id, role: organizationMembers.role, email: profiles.email, fullName: profiles.fullName, phone: profiles.phone }).from(organizationMembers).innerJoin(profiles, eq(profiles.id, organizationMembers.profileId)).where(eq(organizationMembers.organizationId, organisationId)).orderBy(asc(profiles.fullName)),
    db.select().from(addresses).where(eq(addresses.organizationId, organisationId)).orderBy(desc(addresses.updatedAt)),
    db.select({ id: orders.id, number: orders.number, status: orders.status, grandTotal: orders.grandTotal, createdAt: orders.createdAt }).from(orders).where(eq(orders.organizationId, organisationId)).orderBy(desc(orders.createdAt)).limit(20),
    db.select({ id: quotes.id, number: quotes.number, status: quotes.status, grandTotal: quotes.grandTotal, createdAt: quotes.createdAt }).from(quotes).where(eq(quotes.organizationId, organisationId)).orderBy(desc(quotes.createdAt)).limit(20),
  ]);
  return { ...organisation, members, addresses: organisationAddresses, orders: organisationOrders, quotes: organisationQuotes };
}

export async function listAdminAuditLogs(role: StaffRole, filters: { action?: string; resourceType?: string } = {}) {
  if (!canAccessAdmin(role, "logs", "read")) throw new AdminReadError("This role cannot view audit logs.");
  const conditions = [
    filters.action?.trim() ? ilike(auditLogs.action, `%${filters.action.trim()}%`) : undefined,
    filters.resourceType?.trim() ? eq(auditLogs.resourceType, filters.resourceType.trim()) : undefined,
  ].filter((condition): condition is NonNullable<typeof condition> => Boolean(condition));
  return getDb().select({ id: auditLogs.id, action: auditLogs.action, resourceType: auditLogs.resourceType, resourceId: auditLogs.resourceId, actorEmail: profiles.email, actorName: profiles.fullName, createdAt: auditLogs.createdAt }).from(auditLogs).leftJoin(profiles, eq(profiles.id, auditLogs.actorProfileId)).where(conditions.length ? sql.join(conditions, sql` and `) : undefined).orderBy(desc(auditLogs.createdAt)).limit(100);
}
