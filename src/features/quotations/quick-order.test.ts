import { describe, expect, it } from "vitest";
import { parseQuickOrderForm } from "./quick-order";

function form(pairs: [string, string][]) {
  const data = new FormData();
  for (const [sku, quantity] of pairs) {
    data.append("sku", sku);
    data.append("quantity", quantity);
  }
  return data;
}

describe("parseQuickOrderForm", () => {
  it("keeps two SKU lines and merges duplicates", () => {
    const parsed = parseQuickOrderForm(
      form([
        ["da-a4-80-500", "10"],
        ["HP-305-BLK", "2"],
        ["DA-A4-80-500", "5"],
        ["", ""],
      ]),
    );
    expect(parsed.invalid).toEqual([]);
    expect(parsed.rows).toEqual([
      { sku: "DA-A4-80-500", quantity: 15 },
      { sku: "HP-305-BLK", quantity: 2 },
    ]);
  });

  it("rejects a SKU without a usable quantity", () => {
    const parsed = parseQuickOrderForm(form([["DA-A4-80-500", "0"]]));
    expect(parsed.rows).toEqual([]);
    expect(parsed.invalid[0]).toMatch(/quantity/);
  });

  it("rejects the entire SKU when duplicate quantities exceed the limit", () => {
    const parsed = parseQuickOrderForm(form([
      ["DA-A4-80-500", "9999"],
      ["da-a4-80-500", "1"],
      ["HP-305-BLK", "2"],
    ]));
    expect(parsed.rows).toEqual([{ sku: "HP-305-BLK", quantity: 2 }]);
    expect(parsed.invalid).toHaveLength(1);
  });

  it("accepts a combined quantity exactly at the limit", () => {
    const parsed = parseQuickOrderForm(form([
      ["DA-A4-80-500", "9000"],
      ["da-a4-80-500", "999"],
    ]));
    expect(parsed.rows).toEqual([{ sku: "DA-A4-80-500", quantity: 9999 }]);
    expect(parsed.invalid).toEqual([]);
  });

  it("does not re-add an overflowing SKU when a third duplicate follows", () => {
    const parsed = parseQuickOrderForm(form([
      ["DA-A4-80-500", "9999"],
      ["DA-A4-80-500", "1"],
      ["DA-A4-80-500", "2"],
    ]));
    expect(parsed.rows).toEqual([]);
    expect(parsed.invalid).toHaveLength(1);
  });

  it.each(["-1", "1.5", "10000", "nope", ""])(
    "rejects invalid quantity %s while preserving a valid different SKU",
    (quantity) => {
      const parsed = parseQuickOrderForm(form([
        ["DA-A4-80-500", quantity],
        ["HP-305-BLK", "2"],
      ]));
      expect(parsed.rows).toEqual([{ sku: "HP-305-BLK", quantity: 2 }]);
      expect(parsed.invalid).toHaveLength(1);
    },
  );

  it("ignores blank rows but reports a quantity without a SKU", () => {
    const parsed = parseQuickOrderForm(form([["", ""], ["", "2"]]));
    expect(parsed.rows).toEqual([]);
    expect(parsed.invalid).toHaveLength(1);
  });
});
