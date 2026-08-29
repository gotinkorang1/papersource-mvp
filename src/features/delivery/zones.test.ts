import { storefrontDeliveryBadge } from "@/features/delivery/zones";
import type { DeliveryFeeMode } from "@/types/commerce";

import { describe, expect, it } from "vitest";

const zones: { name: string; region: string; feeMode: DeliveryFeeMode }[] = [
  { name: "Accra Central", region: "Greater Accra", feeMode: "calculated" },
  { name: "Tema", region: "Greater Accra", feeMode: "calculated" },
  { name: "Nationwide Request", region: "Nationwide", feeMode: "on_request" },
];

describe("storefrontDeliveryBadge", () => {
  it("uses Accra and Tema zones for the storefront label", () => {
    expect(storefrontDeliveryBadge(zones)).toEqual({
      label: "Accra & Tema delivery available",
      feeMode: "calculated",
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
    });
  });
});
