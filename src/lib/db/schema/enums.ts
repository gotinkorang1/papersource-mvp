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
