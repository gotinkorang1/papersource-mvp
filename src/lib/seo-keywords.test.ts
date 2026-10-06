import { describe, expect, it } from "vitest";
import { GHANA_KEYWORD_CLUSTERS, GHANA_SEO_KEYWORDS, keywordsForCategory, keywordsForProduct } from "./seo-keywords";

describe("Ghana SEO keyword map", () => {
  it("contains 350 unique, non-empty research phrases", () => {
    expect(Object.keys(GHANA_KEYWORD_CLUSTERS)).toHaveLength(85);
    expect(GHANA_SEO_KEYWORDS).toHaveLength(850);
    expect(new Set(GHANA_SEO_KEYWORDS).size).toBe(850);
    expect(GHANA_SEO_KEYWORDS.every((keyword) => keyword.trim().length > 0)).toBe(true);
  });

  it("returns focused intent terms for page templates", () => {
    expect(keywordsForCategory("paper", "Paper")).toContain("A4 paper Ghana");
    expect(keywordsForProduct({ name: "A4 Copier Paper", brandName: "Double A", categoryName: "Paper" })).toContain("buy A4 Copier Paper online Ghana");
  });
});
