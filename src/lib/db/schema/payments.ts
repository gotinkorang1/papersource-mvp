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
import { paymentProviderEnum, paymentStatusEnum } from "./enums";
import { orders } from "./orders";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: paymentProviderEnum("provider").notNull(),
    status: paymentStatusEnum("status").notNull(),
    amount: integer("amount").notNull(),
    currency: char("currency", { length: 3 }).notNull().default("GHS"),
    paystackReference: text("paystack_reference"),
    authorizationUrl: text("authorization_url"),
    rawInit: jsonb("raw_init"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("payments_paystack_reference_unique").on(
      table.paystackReference,
    ),
    index("payments_order_idx").on(table.orderId),
    index("payments_status_idx").on(table.status),
  ],
);

export const paymentEvents = pgTable(
  "payment_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "cascade" }),
    providerEventId: text("provider_event_id").notNull(),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload"),
    processedAt: timestamp("processed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("payment_events_provider_event_unique").on(
      table.providerEventId,
    ),
    index("payment_events_payment_idx").on(table.paymentId),
  ],
);
