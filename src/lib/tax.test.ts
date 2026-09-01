import { describe, expect, it } from "vitest";
import { GHANA_VAT_BPS, inclusiveVatBreakdown } from "./tax";

describe("inclusiveVatBreakdown", () => {
  it("persists VAT as tax_total plus tax_json", () => {
    const breakdown = inclusiveVatBreakdown(11500);

    expect(GHANA_VAT_BPS).toBe(1500);
    expect(breakdown.taxTotal).toBe(1500);
    expect(breakdown.taxJson).toEqual([
      { name: "VAT", rate_bps: 1500, amount: 1500 },
    ]);
  });

  it("supports the admin-configured basis-point rate", () => {
    expect(inclusiveVatBreakdown(11000, 1000)).toEqual({
      taxTotal: 1000,
      taxJson: [{ name: "VAT", rate_bps: 1000, amount: 1000 }],
    });
  });
});
