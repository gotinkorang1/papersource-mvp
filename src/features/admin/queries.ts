import { asc, desc, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { addresses, adminRoles, organizationMembers, organizations, payments, orders, profiles, quotes, deliveryZones } from "@/lib/db/schema";
import { canAccessAdmin } from "@/lib/staff/rbac";
import type { StaffRole } from "@/lib/staff/types";

export class AdminReadError extends Error {}

function assertRead(role: StaffRole, area: "customers" | "organisations" | "payments" | "deliveries") {
  if (!canAccessAdmin(role, area, "read")) throw new AdminReadError("This role cannot view that desk.");
}

export async function listAdminCustomers(role: StaffRole) {
  assertRead(role, "customers");
  return getDb().select({ id: profiles.id, email: profiles.email, fullName: profiles.fullName, phone: profiles.phone, updatedAt: profiles.updatedAt })
    .from(profiles).leftJoin(adminRoles, eq(adminRoles.profileId, profiles.id)).where(isNull(adminRoles.profileId)).orderBy(desc(profiles.updatedAt));
}

export async function listAdminOrganisations(role: StaffRole) {
  assertRead(role, "organisations");
  return getDb().select({ id: organizations.id, name: organizations.name, type: organizations.type, email: organizations.email, phone: organizations.phone, memberCount: sql<number>`count(${organizationMembers.id})::int`, updatedAt: organizations.updatedAt })
    .from(organizations).leftJoin(organizationMembers, eq(organizationMembers.organizationId, organizations.id)).groupBy(organizations.id).orderBy(desc(organizations.updatedAt));
}

export async function listAdminPayments(role: StaffRole) {
  assertRead(role, "payments");
  return getDb().select({ id: payments.id, provider: payments.provider, status: payments.status, amount: payments.amount, currency: payments.currency, reference: payments.paystackReference, orderNumber: orders.number, customerEmail: profiles.email, createdAt: payments.createdAt })
    .from(payments).innerJoin(orders, eq(orders.id, payments.orderId)).leftJoin(profiles, eq(profiles.id, orders.profileId)).orderBy(desc(payments.createdAt));
}

export async function listAdminDeliveries(role: StaffRole) {
  assertRead(role, "deliveries");
  return getDb().select({ id: orders.id, number: orders.number, status: orders.status, source: orders.source, grandTotal: orders.grandTotal, zoneName: deliveryZones.name, zoneRegion: deliveryZones.region, customerEmail: profiles.email, updatedAt: orders.updatedAt })
    .from(orders).innerJoin(deliveryZones, eq(deliveryZones.id, orders.deliveryZoneId)).leftJoin(profiles, eq(profiles.id, orders.profileId)).orderBy(asc(orders.status), desc(orders.updatedAt));
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
