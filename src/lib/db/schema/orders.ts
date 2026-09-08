import {
  char,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { productVariants } from "./catalogue";
import { deliveryZones } from "./delivery";
import {
  deliveryFeeStatusEnum,
  orderSourceEnum,
  orderStatusEnum,
} from "./enums";
import { organizations, profiles } from "./identity";
import { quotes } from "./commerce";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    number: text("number").notNull(),
    source: orderSourceEnum("source").notNull(),
    quoteId: uuid("quote_id").references(() => quotes.id),
    profileId: uuid("profile_id").references(() => profiles.id),
    organizationId: uuid("organization_id").references(() => organizations.id),
    sessionId: text("session_id"),
    status: orderStatusEnum("status").notNull(),
    currency: char("currency", { length: 3 }).notNull().default("GHS"),
    goodsTotal: integer("goods_total").notNull(),
    taxTotal: integer("tax_total").notNull(),
    taxJson: jsonb("tax_json"),
    deliveryFee: integer("delivery_fee").notNull().default(0),
    deliveryFeeStatus: deliveryFeeStatusEnum("delivery_fee_status").notNull(),
    discountTotal: integer("discount_total").notNull().default(0),
    grandTotal: integer("grand_total").notNull(),
    addressSnapshot: jsonb("address_snapshot").notNull(),
    deliveryZoneId: uuid("delivery_zone_id")
      .notNull()
      .references(() => deliveryZones.id),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("orders_number_unique").on(table.number),
    index("orders_session_idx").on(table.sessionId),
    index("orders_status_idx").on(table.status),
    index("orders_profile_idx").on(table.profileId),
    index("orders_organization_idx").on(table.organizationId),
    index("orders_quote_idx").on(table.quoteId),
    index("orders_delivery_zone_idx").on(table.deliveryZoneId),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id),
    nameSnapshot: text("name_snapshot").notNull(),
    skuSnapshot: text("sku_snapshot").notNull(),
    specSnapshot: text("spec_snapshot"),
    quantity: integer("quantity").notNull(),
    unitPrice: integer("unit_price").notNull(),
    lineTotal: integer("line_total").notNull(),
    taxTotal: integer("tax_total").notNull().default(0),
  },
  (table) => [index("order_items_order_idx").on(table.orderId), index("order_items_variant_idx").on(table.variantId)],
);
