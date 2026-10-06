import { describe, expect, it } from "vitest";
import { SEO_GUIDES, SEO_GUIDES_UPDATED_AT, getSeoGuide, seoGuideUrl } from "./seo-guides";

describe("SEO buying guides", () => {
  it("provides a useful Ghana-focused guide set with unique slugs", () => {
    expect(SEO_GUIDES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(SEO_GUIDES.map((guide) => guide.slug)).size).toBe(SEO_GUIDES.length);
    expect(SEO_GUIDES.every((guide) => guide.title.length > 20 && guide.description.length > 60)).toBe(true);
    expect(SEO_GUIDES.filter((guide) => `${guide.title} ${guide.description} ${guide.intro}`.includes("Ghana")).length).toBeGreaterThanOrEqual(6);
  });

  it("keeps guide links internal and resolves canonical URLs", () => {
    const guideLinks = SEO_GUIDES.flatMap((guide) => guide.links);
    expect(guideLinks.every((link) => link.href.startsWith("/"))).toBe(true);
    expect(guideLinks.some((link) => link.href === "/shop/writing")).toBe(false);
    expect(getSeoGuide("shop-pickup-guide")?.title).toContain("pickup");
    expect(seoGuideUrl("shop-pickup-guide")).toBe("https://www.papersourcegh.com/guides/shop-pickup-guide");
  });

  it("keeps every guide addressable for sitemap discovery", () => {
    expect(SEO_GUIDES.every((guide) => seoGuideUrl(guide.slug).startsWith("https://www.papersourcegh.com/guides/"))).toBe(true);
  });

  it("publishes a valid review date for freshness metadata", () => {
    expect(Number.isNaN(Date.parse(SEO_GUIDES_UPDATED_AT))).toBe(false);
    expect(SEO_GUIDES_UPDATED_AT).toBe("2026-10-06");
  });
});
