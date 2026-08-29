import { describe, expect, it } from "vitest";
import { resolveUnitPrice } from "@/features/catalogue/pricing";
import { retailCheckoutBlocked } from "./eligibility";

describe("retailCheckoutBlocked", () => {
  it("rejects request-quote tiers from retail checkout", () => {
    const resolved = resolveUnitPrice({
      quantity: 50,
      baseUnitPricePesewas: 7800,
      tiers: [
        {
          minimumQuantity: 50,
          maximumQuantity: null,
          unitPricePesewas: null,
          requestQuote: true,
        },
      ],
    });
    expect(retailCheckoutBlocked(resolved)).toBe(true);
  });

  it("allows a published unit price", () => {
    const resolved = resolveUnitPrice({
      quantity: 1,
      baseUnitPricePesewas: 7800,
      tiers: [],
    });
    expect(retailCheckoutBlocked(resolved)).toBe(false);
  });
});
