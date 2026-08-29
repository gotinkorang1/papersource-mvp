import { describe, expect, it } from "vitest";
import {
  lineTotalPesewas,
  resolveUnitPrice,
  tiersOverlap,
  type PriceTierInput,
} from "./pricing";

const a4Tiers: PriceTierInput[] = [
  {
    minimumQuantity: 1,
    maximumQuantity: 4,
    unitPricePesewas: 7800,
    requestQuote: false,
  },
  {
    minimumQuantity: 5,
    maximumQuantity: 19,
    unitPricePesewas: 7500,
    requestQuote: false,
  },
  {
    minimumQuantity: 20,
    maximumQuantity: 49,
    unitPricePesewas: 7150,
    requestQuote: false,
  },
  {
    minimumQuantity: 50,
    maximumQuantity: null,
    unitPricePesewas: null,
    requestQuote: true,
  },
];

describe("resolveUnitPrice", () => {
  it("uses the 1–4 band for a single ream", () => {
    expect(
      resolveUnitPrice({
        quantity: 1,
        baseUnitPricePesewas: 7800,
        tiers: a4Tiers,
      }),
    ).toEqual({
      unitPricePesewas: 7800,
      requestQuote: false,
      tierApplied: { min: 1, max: 4 },
      currency: "GHS",
    });
  });

  it("drops unit price at five reams", () => {
    expect(
      resolveUnitPrice({
        quantity: 5,
        baseUnitPricePesewas: 7800,
        tiers: a4Tiers,
      }).unitPricePesewas,
    ).toBe(7500);
  });

  it("uses the 20–49 band", () => {
    expect(
      resolveUnitPrice({
        quantity: 20,
        baseUnitPricePesewas: 7800,
        tiers: a4Tiers,
      }).unitPricePesewas,
    ).toBe(7150);
  });

  it("marks 50+ as request quote without inventing a unit price", () => {
    expect(
      resolveUnitPrice({
        quantity: 50,
        baseUnitPricePesewas: 7800,
        tiers: a4Tiers,
      }),
    ).toMatchObject({
      unitPricePesewas: null,
      requestQuote: true,
      tierApplied: { min: 50, max: null },
    });
  });

  it("falls back to base_unit_price when no tier matches", () => {
    expect(
      resolveUnitPrice({
        quantity: 2,
        baseUnitPricePesewas: 2800,
        tiers: [
          {
            minimumQuantity: 20,
            maximumQuantity: null,
            unitPricePesewas: null,
            requestQuote: true,
          },
        ],
      }),
    ).toEqual({
      unitPricePesewas: 2800,
      requestQuote: false,
      tierApplied: null,
      currency: "GHS",
    });
  });
});

describe("tiersOverlap", () => {
  it("accepts contiguous non-overlapping bands", () => {
    expect(tiersOverlap(a4Tiers)).toBe(false);
  });

  it("flags overlapping bands", () => {
    expect(
      tiersOverlap([
        {
          minimumQuantity: 1,
          maximumQuantity: 10,
          unitPricePesewas: 100,
          requestQuote: false,
        },
        {
          minimumQuantity: 10,
          maximumQuantity: 20,
          unitPricePesewas: 90,
          requestQuote: false,
        },
      ]),
    ).toBe(true);
  });
});

describe("lineTotalPesewas", () => {
  it("multiplies in integer pesewas", () => {
    expect(lineTotalPesewas(7500, 5)).toBe(37500);
  });
});
