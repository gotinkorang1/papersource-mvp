import { describe, expect, it } from "vitest";
import { parseDeliveryZone } from "./admin";
import { canAccessAdmin } from "@/lib/staff/rbac";

describe("parseDeliveryZone", () => {
  it("normalizes a calculated zone and keeps money in integer pesewas", () => {
    expect(parseDeliveryZone({
      name: "  Accra Central ", region: " Greater Accra ", code: "Accra Central",
      basePrice: "25.50", feeMode: "calculated", freeShippingThreshold: "500",
      estimatedMinDays: "1", estimatedMaxDays: "2", active: "true", sortOrder: "10",
    })).toEqual({
      name: "Accra Central", region: "Greater Accra", code: "accra-central",
      basePrice: 2550, feeMode: "calculated", freeShippingThreshold: 50000,
      estimatedMinDays: 1, estimatedMaxDays: 2, active: true, sortOrder: 10,
    });
  });

  it("forces on-request fees to zero and rejects inverted delivery windows", () => {
    expect(parseDeliveryZone({
      name: "Nationwide", region: "Ghana", code: "nationwide", basePrice: "99",
      feeMode: "on_request", freeShippingThreshold: "100", estimatedMinDays: "3",
      estimatedMaxDays: "7", active: "false", sortOrder: "20",
    }).basePrice).toBe(0);
    expect(() => parseDeliveryZone({
      name: "Bad", region: "Ghana", code: "bad", basePrice: "0", feeMode: "calculated",
      freeShippingThreshold: "", estimatedMinDays: "5", estimatedMaxDays: "2",
      active: "true", sortOrder: "0",
    })).toThrow(/Maximum delivery days/);
  });

  it("keeps zone writes restricted to ADMIN and SUPER_ADMIN", () => {
    expect(canAccessAdmin("admin", "delivery_zones", "write")).toBe(true);
    expect(canAccessAdmin("super_admin", "delivery_zones", "write")).toBe(true);
    expect(canAccessAdmin("sales", "delivery_zones", "write")).toBe(false);
    expect(canAccessAdmin("warehouse", "delivery_zones", "write")).toBe(false);
  });
});
