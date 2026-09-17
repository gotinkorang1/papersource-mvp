import { describe, expect, it } from "vitest";
import {
  buildSpecLine,
  buildSupplementalSpecLine,
  matchesCatalogueQuery,
  uniqueCatalogueProducts,
} from "./search";

describe("buildSpecLine", () => {
  it("joins paper attributes in catalogue order", () => {
    expect(
      buildSpecLine([
        { key: "sheets", valueText: "500 sheets" },
        { key: "size", valueText: "A4" },
        { key: "gsm", valueText: "80gsm" },
      ]),
    ).toBe("A4 • 80gsm • 500 sheets");
  });
});

describe("matchesCatalogueQuery", () => {
  it("matches SKU, brand, and compatibility aliases", () => {
    const haystacks = [
      "HP 305 Black Ink Cartridge",
      "HP-305-BLK",
      "HP",
      "Printing",
      "HP 305 black",
      "DeskJet 2700",
    ];

    expect(matchesCatalogueQuery(haystacks, "HP 305 black")).toBe(true);
    expect(matchesCatalogueQuery(haystacks, "A4 80gsm")).toBe(false);
  });
});

describe("uniqueCatalogueProducts", () => {
  it("keeps one storefront row per product while preserving the first variant", () => {
    const rows = uniqueCatalogueProducts([
      { product: { id: "product-1" }, variant: { id: "variant-a" } },
      { product: { id: "product-1" }, variant: { id: "variant-b" } },
      { product: { id: "product-2" }, variant: { id: "variant-c" } },
    ]);

    expect(rows.map((row) => row.variant.id)).toEqual(["variant-a", "variant-c"]);
  });
});

describe("buildSupplementalSpecLine", () => {
  it("ignores author and format attributes outside the book namespace", () => {
    expect(
      buildSupplementalSpecLine([
        { namespace: "paper", key: "author", valueText: "Paper Author" },
        { namespace: "paper", key: "format", valueText: "A4" },
      ]),
    ).toBe("");
  });
});
