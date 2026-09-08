import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { productVariants } from "./catalogue";
import { inventoryMovementReasonEnum } from "./enums";

export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  variantId: uuid("variant_id")
    .notNull()
    .unique()
    .references(() => productVariants.id),
  onHand: integer("on_hand").notNull().default(0),
  reserved: integer("reserved").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
});

export const inventoryMovements = pgTable("inventory_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  variantId: uuid("variant_id")
    .notNull()
    .references(() => productVariants.id),
  delta: integer("delta").notNull(),
  reason: inventoryMovementReasonEnum("reason").notNull(),
  referenceType: text("reference_type"),
  referenceId: uuid("reference_id"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [index("inventory_movements_variant_idx").on(table.variantId)]);
