import {
  boolean,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { deliveryFeeModeEnum } from "./enums";

export const deliveryZones = pgTable(
  "delivery_zones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    region: text("region").notNull(),
    code: text("code").notNull(),
    basePrice: integer("base_price").notNull(),
    feeMode: deliveryFeeModeEnum("fee_mode").notNull(),
    freeShippingThreshold: integer("free_shipping_threshold"),
    estimatedMinDays: integer("estimated_min_days").notNull(),
    estimatedMaxDays: integer("estimated_max_days").notNull(),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [uniqueIndex("delivery_zones_code_unique").on(table.code)],
);
