import { describe, expect, it } from "vitest";
import { canAccessAdmin } from "./rbac";

describe("admin RBAC", () => {
  it("lets sales price quotes but not change settings or zones", () => {
    expect(canAccessAdmin("sales", "quotes", "write")).toBe(true);
    expect(canAccessAdmin("sales", "settings", "write")).toBe(false);
    expect(canAccessAdmin("sales", "delivery_zones", "write")).toBe(false);
    expect(canAccessAdmin("sales", "roles", "write")).toBe(false);
  });

  it("lets warehouse fulfil orders but not edit prices", () => {
    expect(canAccessAdmin("warehouse", "orders", "write")).toBe(true);
    expect(canAccessAdmin("warehouse", "inventory", "write")).toBe(true);
    expect(canAccessAdmin("warehouse", "pricing", "write")).toBe(false);
    expect(canAccessAdmin("warehouse", "quotes", "read")).toBe(true);
    expect(canAccessAdmin("warehouse", "quotes", "write")).toBe(false);
  });

  it("keeps content managers off quotes, orders, and payments", () => {
    expect(canAccessAdmin("content_manager", "quotes", "read")).toBe(false);
    expect(canAccessAdmin("content_manager", "orders", "read")).toBe(false);
    expect(canAccessAdmin("content_manager", "payments", "write")).toBe(false);
    expect(canAccessAdmin("content_manager", "products", "write")).toBe(true);
  });
});
