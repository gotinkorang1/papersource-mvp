import { describe, expect, it } from "vitest";
import { InventoryAdminError, parseBulkInventoryAdjustment, parseInventoryAdjustment } from "./admin";
import { canAccessAdmin } from "@/lib/staff/rbac";

describe("parseInventoryAdjustment", () => {
  it("accepts a receive delta in whole units", () => {
    expect(parseInventoryAdjustment({ delta: "12", reason: "receive" })).toEqual({
      delta: 12,
      reason: "receive",
    });
  });

  it("rejects a zero change", () => {
    expect(() => parseInventoryAdjustment({ delta: "0", reason: "adjust" })).toThrow(
      InventoryAdminError,
    );
  });

  it("rejects reserve as a desk reason", () => {
    expect(() => parseInventoryAdjustment({ delta: "2", reason: "reserve" })).toThrow(
      /receive or adjust/,
    );
  });
});

describe("parseBulkInventoryAdjustment", () => {
  it("normalizes a positive add operation", () => {
    expect(parseBulkInventoryAdjustment({ quantity: "12", operation: "add", reason: "receive", variantIds: ["a", "b"] })).toEqual({
      delta: 12,
      reason: "receive",
      variantIds: ["a", "b"],
    });
  });

  it("turns remove into a negative delta", () => {
    expect(parseBulkInventoryAdjustment({ quantity: "3", operation: "remove", reason: "adjust", variantIds: ["a"] })).toEqual({
      delta: -3,
      reason: "adjust",
      variantIds: ["a"],
    });
  });

  it("deduplicates repeated selected variants", () => {
    expect(parseBulkInventoryAdjustment({ quantity: "2", operation: "add", reason: "receive", variantIds: ["a", "a", "b"] }).variantIds).toEqual(["a", "b"]);
  });

  it("rejects an empty selection and invalid quantity", () => {
    expect(() => parseBulkInventoryAdjustment({ quantity: "0", operation: "add", reason: "receive", variantIds: [] })).toThrow(/select at least one variant/i);
    expect(() => parseBulkInventoryAdjustment({ quantity: "-2", operation: "remove", reason: "adjust", variantIds: ["a"] })).toThrow(/positive whole-number quantity/);
  });
});

describe("catalogue RBAC", () => {
  it("keeps warehouse off price tiers", () => {
    expect(canAccessAdmin("warehouse", "pricing", "write")).toBe(false);
    expect(canAccessAdmin("warehouse", "inventory", "write")).toBe(true);
  });

  it("keeps content off pricing and inventory", () => {
    expect(canAccessAdmin("content_manager", "products", "write")).toBe(true);
    expect(canAccessAdmin("content_manager", "pricing", "write")).toBe(false);
    expect(canAccessAdmin("content_manager", "inventory", "write")).toBe(false);
  });

  it("keeps sales as catalogue readers", () => {
    expect(canAccessAdmin("sales", "products", "read")).toBe(true);
    expect(canAccessAdmin("sales", "products", "write")).toBe(false);
    expect(canAccessAdmin("sales", "pricing", "write")).toBe(false);
  });
});
