import { asc, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  inventory,
  inventoryMovements,
  products,
  productVariants,
} from "@/lib/db/schema";
import { inventoryMovementReasonEnum } from "@/lib/db/schema/enums";
import type { StaffRole } from "@/lib/staff/types";
import { canAccessAdmin } from "@/lib/staff/rbac";

export class InventoryAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InventoryAdminError";
  }
}

export const INVENTORY_ADJUST_REASONS = ["receive", "adjust"] as const;

export function parseInventoryAdjustment(input: { delta: string; reason: string }) {
  const delta = Number(input.delta.trim());
  if (!Number.isInteger(delta) || delta === 0) {
    throw new InventoryAdminError("Enter a whole-number stock change that is not zero.");
  }
  if (!INVENTORY_ADJUST_REASONS.includes(input.reason as (typeof INVENTORY_ADJUST_REASONS)[number])) {
    throw new InventoryAdminError("Use receive or adjust as the stock reason.");
  }
  return {
    delta,
    reason: input.reason as (typeof INVENTORY_ADJUST_REASONS)[number],
  };
}

export async function listInventoryRows() {
  const db = getDb();
  return db
    .select({
      inventoryId: inventory.id,
      variantId: productVariants.id,
      sku: productVariants.sku,
      productName: products.name,
      productId: products.id,
      onHand: inventory.onHand,
      reserved: inventory.reserved,
      lowStockThreshold: inventory.lowStockThreshold,
    })
    .from(inventory)
    .innerJoin(productVariants, eq(productVariants.id, inventory.variantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(isNull(products.deletedAt))
    .orderBy(asc(products.name), asc(productVariants.sku));
}

export async function adjustInventory(input: {
  role: StaffRole;
  actorId: string;
  variantId: string;
  delta: number;
  reason: string;
}) {
  if (!canAccessAdmin(input.role, "inventory", "write")) {
    throw new InventoryAdminError("This role cannot change stock.");
  }
  const parsed = parseInventoryAdjustment({
    delta: String(input.delta),
    reason: input.reason,
  });
  const reason = parsed.reason as (typeof inventoryMovementReasonEnum.enumValues)[number];

  const db = getDb();
  await db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(inventory)
      .where(eq(inventory.variantId, input.variantId))
      .limit(1);
    if (!row) {
      throw new InventoryAdminError("That variant has no inventory row.");
    }
    const next = row.onHand + input.delta;
    if (next < 0) {
      throw new InventoryAdminError("Stock cannot go below zero.");
    }
    await tx
      .update(inventory)
      .set({ onHand: sql`${inventory.onHand} + ${parsed.delta}` })
      .where(eq(inventory.id, row.id));
    await tx.insert(inventoryMovements).values({
      variantId: input.variantId,
      delta: parsed.delta,
      reason,
      referenceType: "admin",
      createdBy: input.actorId,
    });
  });
}
