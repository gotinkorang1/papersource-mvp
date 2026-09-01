import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { deliveryZones } from "@/lib/db/schema";
import { parseGhsToPesewas } from "@/lib/money";
import { canAccessAdmin } from "@/lib/staff/rbac";
import type { StaffRole } from "@/lib/staff/types";
import { slugify } from "@/lib/slug";

export class DeliveryAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DeliveryAdminError";
  }
}

export type DeliveryZoneForm = {
  name: string;
  region: string;
  code: string;
  basePrice: string;
  feeMode: string;
  freeShippingThreshold: string;
  estimatedMinDays: string;
  estimatedMaxDays: string;
  active: string;
  sortOrder: string;
};

export function parseDeliveryZone(input: DeliveryZoneForm) {
  const text = (value: string, label: string) => {
    const parsed = value.trim();
    if (!parsed) throw new DeliveryAdminError(`${label} is required.`);
    return parsed;
  };
  const whole = (value: string, label: string, minimum = 0) => {
    if (!/^-?\d+$/.test(value.trim())) throw new DeliveryAdminError(`${label} must be a whole number.`);
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < minimum) throw new DeliveryAdminError(`${label} must be at least ${minimum}.`);
    return parsed;
  };
  const feeMode = z.enum(["calculated", "on_request"]).safeParse(input.feeMode);
  if (!feeMode.success) throw new DeliveryAdminError("Choose a valid fee mode.");
  const estimatedMinDays = whole(input.estimatedMinDays, "Minimum delivery days");
  const estimatedMaxDays = whole(input.estimatedMaxDays, "Maximum delivery days");
  if (estimatedMaxDays < estimatedMinDays) {
    throw new DeliveryAdminError("Maximum delivery days cannot be less than the minimum delivery days.");
  }
  const freeShipping = input.freeShippingThreshold.trim();
  const calculated = feeMode.data === "calculated";
  let basePrice = 0;
  let freeShippingThreshold: number | null = null;
  try {
    basePrice = calculated ? parseGhsToPesewas(input.basePrice) : 0;
    freeShippingThreshold = calculated && freeShipping ? parseGhsToPesewas(freeShipping) : null;
  } catch (error) {
    throw new DeliveryAdminError(error instanceof Error ? error.message : "Enter a valid GHS amount.");
  }
  if (basePrice < 0 || (freeShippingThreshold !== null && freeShippingThreshold < 0)) {
    throw new DeliveryAdminError("Delivery prices cannot be negative.");
  }
  const code = slugify(text(input.code || input.name, "Code"));
  if (!code) throw new DeliveryAdminError("Code must contain letters or numbers.");
  return {
    name: text(input.name, "Name"),
    region: text(input.region, "Region"),
    code,
    basePrice,
    feeMode: feeMode.data,
    freeShippingThreshold,
    estimatedMinDays,
    estimatedMaxDays,
    active: input.active === "true",
    sortOrder: whole(input.sortOrder || "0", "Sort order", 0),
  };
}

function assertWrite(role: StaffRole) {
  if (!canAccessAdmin(role, "delivery_zones", "write")) {
    throw new DeliveryAdminError("This role cannot change delivery zones.");
  }
}

export async function listAdminDeliveryZones() {
  return getDb().select().from(deliveryZones).orderBy(asc(deliveryZones.sortOrder), asc(deliveryZones.name));
}

export async function createDeliveryZone(input: DeliveryZoneForm & { role: StaffRole }) {
  assertWrite(input.role);
  const [created] = await getDb().insert(deliveryZones).values(parseDeliveryZone(input)).returning();
  if (!created) throw new DeliveryAdminError("Could not create the delivery zone.");
  return created;
}

export async function updateDeliveryZone(input: DeliveryZoneForm & { role: StaffRole; zoneId: string }) {
  assertWrite(input.role);
  const [saved] = await getDb().update(deliveryZones).set(parseDeliveryZone(input)).where(eq(deliveryZones.id, input.zoneId)).returning();
  if (!saved) throw new DeliveryAdminError("That delivery zone was not found.");
  return saved;
}

export async function deleteDeliveryZone(input: { role: StaffRole; zoneId: string }) {
  assertWrite(input.role);
  try {
    const [deleted] = await getDb().delete(deliveryZones).where(eq(deliveryZones.id, input.zoneId)).returning();
    if (!deleted) throw new DeliveryAdminError("That delivery zone was not found.");
    return deleted;
  } catch (error) {
    if (error instanceof DeliveryAdminError) throw error;
    throw new DeliveryAdminError("This zone is already used by commerce history. Deactivate it instead.");
  }
}
