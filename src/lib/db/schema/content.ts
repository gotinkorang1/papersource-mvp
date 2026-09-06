import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const contentPages = pgTable("content_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("draft"),
  ...timestamps,
}, (table) => [uniqueIndex("content_pages_slug_unique").on(table.slug), index("content_pages_status_idx").on(table.status)]);

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  position: integer("position").notNull().default(0),
  status: text("status").notNull().default("draft"),
  ...timestamps,
}, (table) => [index("faqs_status_position_idx").on(table.status, table.position)]);

export const navigationItems = pgTable("navigation_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull(),
  href: text("href").notNull(),
  placement: text("placement").notNull(),
  position: integer("position").notNull().default(0),
  active: boolean("active").notNull().default(true),
  ...timestamps,
}, (table) => [index("navigation_items_placement_active_idx").on(table.placement, table.active, table.position)]);
