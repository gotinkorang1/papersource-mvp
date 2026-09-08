import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { profiles } from "./identity";
import { paymentModeEnum } from "./enums";

export const storeSettings = pgTable("store_settings", {
  id: text("id").primaryKey().default("store"),
  vatRateBps: integer("vat_rate_bps").notNull().default(1500),
  quoteExpiryDays: integer("quote_expiry_days").notNull().default(14),
  whatsappBusinessNumber: text("whatsapp_business_number"),
  siteUrl: text("site_url").notNull().default("http://localhost:3000"),
  paymentsEnabled: boolean("payments_enabled").notNull().default(true),
  paymentMode: paymentModeEnum("payment_mode").notNull().default("test"),
  updatedBy: uuid("updated_by").references(() => profiles.id, { onDelete: "set null" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("store_settings_updated_by_idx").on(table.updatedBy)]);
