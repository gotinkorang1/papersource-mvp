import { describe, expect, it } from "vitest";
import { itemCountLabel } from "./copy";

describe("itemCountLabel", () => {
  it("singularizes a count of one", () => {
    expect(itemCountLabel("Cart", 1)).toBe("Cart, 1 item");
  });

  it("pluralizes zero and many", () => {
    expect(itemCountLabel("Quote list", 0)).toBe("Quote list, 0 items");
    expect(itemCountLabel("Cart", 2)).toBe("Cart, 2 items");
  });
});
