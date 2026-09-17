import { describe, expect, it } from "vitest";
import { categorySeoDescription } from "./seo-copy";

describe("categorySeoDescription", () => {
  it("gives a useful stationery-specific introduction for known categories", () => {
    expect(categorySeoDescription({ slug: "school-supplies", name: "School Supplies", caption: "Books, geometry, art" })).toMatch(/books|geometry|art/i);
  });

  it("keeps unknown categories truthful with a safe fallback", () => {
    expect(categorySeoDescription({ slug: "custom", name: "Custom Supplies", caption: "Special items" })).toContain("Special items");
  });
});
