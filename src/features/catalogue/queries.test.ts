import { describe, expect, it } from "vitest";
import { canonicalCategorySlug } from "./queries";

describe("canonicalCategorySlug", () => {
  it("maps retired catalogue slugs to their canonical division URL", () => {
    expect(canonicalCategorySlug("paper")).toBe("paper-printing");
    expect(canonicalCategorySlug("printer-supplies")).toBe("paper-printing");
    expect(canonicalCategorySlug("current-category")).toBe("current-category");
  });
});
