import { pgTable, text, timestamp, uuid, index, uniqueIndex } from "drizzle-orm/pg-core";
import { documentPurposeEnum } from "./enums";
import { organizations, profiles } from "./identity";
import { quotes } from "./commerce";
import { orders } from "./orders";

export const uploadedDocuments = pgTable(
  "uploaded_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerProfileId: uuid("owner_profile_id").references(() => profiles.id),
    organizationId: uuid("organization_id").references(() => organizations.id),
    quoteId: uuid("quote_id").references(() => quotes.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    bucket: text("bucket").notNull().default("documents"),
    path: text("path").notNull(),
    filename: text("filename").notNull(),
    mime: text("mime").notNull(),
    purpose: documentPurposeEnum("purpose").notNull().default("rfq"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("uploaded_documents_quote_idx").on(table.quoteId),
    uniqueIndex("uploaded_documents_path_unique").on(table.bucket, table.path),
  ],
);
