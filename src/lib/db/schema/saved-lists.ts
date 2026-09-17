import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { organizations, profiles } from "./identity";
import { productVariants } from "./catalogue";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const savedLists = pgTable(
  "saved_lists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerProfileId: uuid("owner_profile_id").references(() => profiles.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    ...timestamps,
  },
  (table) => [
    check("saved_lists_one_owner_check", sql`num_nonnulls(${table.ownerProfileId}, ${table.organizationId}) = 1`),
    index("saved_lists_profile_idx").on(table.ownerProfileId),
    index("saved_lists_organization_idx").on(table.organizationId),
  ],
);

export const savedListItems = pgTable(
  "saved_list_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    savedListId: uuid("saved_list_id").notNull().references(() => savedLists.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").notNull().references(() => productVariants.id),
    quantity: integer("quantity").notNull().default(1),
    note: text("note"),
    ...timestamps,
  },
  (table) => [
    check("saved_list_items_quantity_positive", sql`${table.quantity} > 0`),
    uniqueIndex("saved_list_items_list_variant_unique").on(table.savedListId, table.variantId),
    index("saved_list_items_list_idx").on(table.savedListId),
    index("saved_list_items_variant_idx").on(table.variantId),
  ],
);
