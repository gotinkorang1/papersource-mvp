import { asc, eq, inArray, isNull, sql } from "drizzle-orm";
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

export const INVENTORY_BULK_OPERATIONS = ["add", "remove"] as const;

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

export function parseBulkInventoryAdjustment(input: {
  quantity: string;
  operation: string;
  reason: string;
  variantIds: string[];
}) {
  const quantity = Number(input.quantity.trim());
  const variantIds = [...new Set(input.variantIds)];
  if (!variantIds.length) {
    throw new InventoryAdminError("Select at least one variant before applying a bulk update.");
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new InventoryAdminError("Enter a positive whole-number quantity.");
  }
  if (!INVENTORY_BULK_OPERATIONS.includes(input.operation as (typeof INVENTORY_BULK_OPERATIONS)[number])) {
    throw new InventoryAdminError("Choose whether to add or remove stock.");
  }
  if (!INVENTORY_ADJUST_REASONS.includes(input.reason as (typeof INVENTORY_ADJUST_REASONS)[number])) {
    throw new InventoryAdminError("Use receive or adjust as the stock reason.");
  }
  return {
    delta: input.operation === "remove" ? -quantity : quantity,
    reason: input.reason as (typeof INVENTORY_ADJUST_REASONS)[number],
    variantIds,
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

export async function bulkAdjustInventory(input: {
  role: StaffRole;
  actorId: string;
  variantIds: string[];
  quantity: string;
  operation: string;
  reason: string;
}) {
  if (!canAccessAdmin(input.role, "inventory", "write")) {
    throw new InventoryAdminError("This role cannot change stock.");
  }
  const parsed = parseBulkInventoryAdjustment(input);
  const reason = parsed.reason as (typeof inventoryMovementReasonEnum.enumValues)[number];
  const db = getDb();
  await db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(inventory)
      .where(inArray(inventory.variantId, parsed.variantIds));
    const byVariant = new Map(rows.map((row) => [row.variantId, row]));
    const missing = parsed.variantIds.filter((variantId) => !byVariant.has(variantId));
    if (missing.length) throw new InventoryAdminError("One or more selected variants have no inventory row.");
    const belowZero = parsed.variantIds.find((variantId) => (byVariant.get(variantId)?.onHand ?? 0) + parsed.delta < 0);
    if (belowZero) throw new InventoryAdminError("This bulk removal would take one or more stock levels below zero.");
    for (const variantId of parsed.variantIds) {
      const row = byVariant.get(variantId)!;
      await tx.update(inventory).set({ onHand: sql`${inventory.onHand} + ${parsed.delta}` }).where(eq(inventory.id, row.id));
      await tx.insert(inventoryMovements).values({
        variantId,
        delta: parsed.delta,
        reason,
        referenceType: "admin",
        createdBy: input.actorId,
      });
    }
  });
  return parsed.variantIds.length;
}
