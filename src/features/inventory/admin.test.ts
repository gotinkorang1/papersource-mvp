import { describe, expect, it } from "vitest";
import { InventoryAdminError, parseInventoryAdjustment } from "./admin";
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
