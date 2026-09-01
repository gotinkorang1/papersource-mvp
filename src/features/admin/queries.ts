import { asc, desc, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { adminRoles, organizationMembers, organizations, payments, orders, profiles, deliveryZones } from "@/lib/db/schema";
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
