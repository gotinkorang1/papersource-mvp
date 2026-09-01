import { sql } from "drizzle-orm";
import { date, char, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, type AnyPgColumn } from "drizzle-orm/pg-core";
import { productVariants } from "./catalogue";
import { deliveryZones } from "./delivery";
import {
  deliveryFeeStatusEnum,
  quoteActorTypeEnum,
  quoteStatusEnum,
} from "./enums";
import { profiles, organizations, type AddressSnapshot } from "./identity";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const carts = pgTable(
  "carts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id").references(() => profiles.id),
    sessionId: text("session_id"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("carts_profile_unique").on(table.profileId).where(sql`${table.profileId} is not null`),
    uniqueIndex("carts_guest_session_unique").on(table.sessionId).where(sql`${table.profileId} is null and ${table.sessionId} is not null`),
  ],
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    uniqueIndex("cart_items_cart_variant_unique").on(
      table.cartId,
      table.variantId,
    ),
    index("cart_items_cart_idx").on(table.cartId),
  ],
);

export const quotes = pgTable(
  "quotes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    number: text("number"),
    status: quoteStatusEnum("status").notNull().default("draft"),
    profileId: uuid("profile_id").references(() => profiles.id),
    sessionId: text("session_id"),
    guestEmail: text("guest_email"),
    guestPhone: text("guest_phone"),
    organizationId: uuid("organization_id").references(() => organizations.id),
    contactName: text("contact_name"),
    deliveryZoneId: uuid("delivery_zone_id").references(() => deliveryZones.id),
    requestedDeliveryDate: date("requested_delivery_date"),
    notes: text("notes"),
    addressSnapshot: jsonb("address_snapshot").$type<AddressSnapshot>(),
    currency: char("currency", { length: 3 }).notNull().default("GHS"),
    goodsTotal: integer("goods_total").notNull().default(0),
    taxTotal: integer("tax_total").notNull().default(0),
    taxJson: jsonb("tax_json"),
    deliveryFee: integer("delivery_fee").notNull().default(0),
    deliveryFeeStatus: deliveryFeeStatusEnum("delivery_fee_status")
      .notNull()
      .default("calculated"),
    grandTotal: integer("grand_total").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    parentQuoteId: uuid("parent_quote_id").references((): AnyPgColumn => quotes.id),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("quotes_number_unique").on(table.number),
    index("quotes_session_idx").on(table.sessionId),
    index("quotes_status_idx").on(table.status),
    index("quotes_profile_idx").on(table.profileId),
    index("quotes_organization_idx").on(table.organizationId),
    uniqueIndex("quotes_profile_draft_unique").on(table.profileId).where(sql`${table.profileId} is not null and ${table.status} = 'draft'`),
    uniqueIndex("quotes_guest_draft_unique").on(table.sessionId).where(sql`${table.profileId} is null and ${table.sessionId} is not null and ${table.status} = 'draft'`),
  ],
);

export const quoteItems = pgTable(
  "quote_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id),
    nameSnapshot: text("name_snapshot").notNull(),
    skuSnapshot: text("sku_snapshot").notNull(),
    specSnapshot: text("spec_snapshot"),
    quantity: integer("quantity").notNull(),
    unitPrice: integer("unit_price"),
    lineTotal: integer("line_total"),
    notes: text("notes"),
  },
  (table) => [index("quote_items_quote_idx").on(table.quoteId)],
);

export const quoteEvents = pgTable(
  "quote_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    fromStatus: text("from_status"),
    toStatus: text("to_status").notNull(),
    actorType: quoteActorTypeEnum("actor_type").notNull(),
    actorId: uuid("actor_id"),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("quote_events_quote_idx").on(table.quoteId)],
);

export const quoteAccessTokens = pgTable(
  "quote_access_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("quote_access_tokens_token_unique").on(table.token)],
);
