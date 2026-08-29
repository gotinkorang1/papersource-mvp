import { pgEnum } from "drizzle-orm/pg-core";

export const productTypeEnum = pgEnum("product_type", ["standard", "bundle"]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);

export const deliveryFeeModeEnum = pgEnum("delivery_fee_mode", [
  "calculated",
  "on_request",
]);

export const inventoryMovementReasonEnum = pgEnum("inventory_movement_reason", [
  "receive",
  "adjust",
  "reserve",
  "release",
  "fulfil",
  "return",
]);

export const quoteStatusEnum = pgEnum("quote_status", [
  "draft",
  "submitted",
  "under_review",
  "priced",
  "sent",
  "accepted",
  "payment_pending",
  "paid",
  "order_created",
  "declined",
  "expired",
  "cancelled",
  "revised",
]);

export type QuoteStatus = (typeof quoteStatusEnum.enumValues)[number];

export const deliveryFeeStatusEnum = pgEnum("delivery_fee_status", [
  "calculated",
  "pending_nationwide",
  "waived",
]);

export const quoteActorTypeEnum = pgEnum("quote_actor_type", [
  "customer",
  "guest",
  "admin",
  "system",
]);

export const organizationTypeEnum = pgEnum("organization_type", [
  "business",
  "school",
  "government",
  "ngo",
  "hospital",
  "church",
  "university",
  "retailer",
  "other",
]);

export const orderSourceEnum = pgEnum("order_source", ["cart", "quote"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "awaiting_terms",
  "paid",
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

export const paymentProviderEnum = pgEnum("payment_provider", [
  "paystack",
  "bank_transfer",
  "purchase_order",
  "invoice_terms",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "initialized",
  "pending",
  "success",
  "failed",
  "abandoned",
]);

export const staffRoleEnum = pgEnum("staff_role", [
  "super_admin",
  "admin",
  "sales",
  "warehouse",
  "content_manager",
]);

export type StaffRole = (typeof staffRoleEnum.enumValues)[number];

export const documentPurposeEnum = pgEnum("document_purpose", [
  "rfq",
  "purchase_order",
  "procurement_list",
  "invoice",
  "internal",
]);

export type DocumentPurpose = (typeof documentPurposeEnum.enumValues)[number];
