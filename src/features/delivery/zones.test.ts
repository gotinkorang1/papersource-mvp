import { storefrontDeliveryBadge } from "@/features/delivery/zones";
import type { DeliveryFeeMode } from "@/types/commerce";

import { describe, expect, it } from "vitest";

const zones: { name: string; region: string; feeMode: DeliveryFeeMode }[] = [
  { name: "Accra Central", region: "Greater Accra", feeMode: "calculated" },
  { name: "Tema", region: "Greater Accra", feeMode: "calculated" },
  { name: "Nationwide Request", region: "Nationwide", feeMode: "on_request" },
  { name: "Shop pickup", region: "Greater Accra", feeMode: "calculated" },
];

describe("storefrontDeliveryBadge", () => {
  it("uses Accra and Tema zones for the storefront label", () => {
    expect(storefrontDeliveryBadge(zones)).toEqual({
      label: "Accra & Tema delivery available",
      feeMode: "calculated",
      pickupAvailable: true,
    });
  });

  it("marks shop pickup available for every catalogue product", () => {
    expect(storefrontDeliveryBadge([
      { name: "Shop pickup", region: "Greater Accra", feeMode: "calculated" },
    ])).toEqual({
      label: "Delivery options vary by location",
      feeMode: "calculated",
      pickupAvailable: true,
    });
  });

  it("does not invent a nationwide fee", () => {
    expect(
      storefrontDeliveryBadge([
        { name: "Nationwide Request", region: "Nationwide", feeMode: "on_request" },
      ]),
    ).toEqual({
      label: "Nationwide delivery can be arranged on request",
      feeMode: "on_request",
      pickupAvailable: false,
    });
  });
});
