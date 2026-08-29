import { describe, expect, it } from "vitest";
import { resolveDeliveryFee, zoneCodeForDeliveryArea } from "./fees";

describe("resolveDeliveryFee", () => {
  it("uses the zone base price for Accra and Tema", () => {
    expect(
      resolveDeliveryFee(
        { feeMode: "calculated", basePrice: 2500, freeShippingThreshold: null },
        7800,
      ),
    ).toEqual({ feePesewas: 2500, status: "calculated" });
  });

  it("does not invent a nationwide fee", () => {
    expect(
      resolveDeliveryFee(
        { feeMode: "on_request", basePrice: 0, freeShippingThreshold: null },
        50000,
      ),
    ).toEqual({ feePesewas: 0, status: "pending_nationwide" });
  });

  it("waives calculated fees at the free-shipping threshold", () => {
    expect(
      resolveDeliveryFee(
        { feeMode: "calculated", basePrice: 2500, freeShippingThreshold: 20000 },
        20000,
      ),
    ).toEqual({ feePesewas: 0, status: "calculated" });
  });
});

describe("zoneCodeForDeliveryArea", () => {
  it("maps Other Region to nationwide request", () => {
    expect(zoneCodeForDeliveryArea("other")).toBe("nationwide_request");
  });
});
