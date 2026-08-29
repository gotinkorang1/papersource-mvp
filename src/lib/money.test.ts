import { describe, expect, it } from "vitest";
import { formatGhs, inclusiveTaxPortion, pesewasToMajor } from "./money";

describe("formatGhs", () => {
  it("formats pesewas as GHS with two decimals", () => {
    expect(formatGhs(7899)).toBe("GHS 78.99");
  });

  it("formats thousands with grouping", () => {
    expect(formatGhs(1_245_000)).toBe("GHS 12,450.00");
  });

  it("rejects floats", () => {
    expect(() => formatGhs(78.99)).toThrow(/integer pesewas/);
  });
});

describe("pesewasToMajor", () => {
  it("returns a schema.org-safe major-unit string", () => {
    expect(pesewasToMajor(7899)).toBe("78.99");
  });
});

describe("inclusiveTaxPortion", () => {
  it("splits 15% VAT from an inclusive total", () => {
    expect(inclusiveTaxPortion(11500, 1500)).toBe(1500);
  });
});
