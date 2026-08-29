import { describe, expect, it } from "vitest";
import { buildSpecLine, matchesCatalogueQuery } from "./search";

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
