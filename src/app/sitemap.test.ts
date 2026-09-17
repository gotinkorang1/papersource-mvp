import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/catalogue", () => ({
  listBrands: async () => [{ slug: "example-brand" }],
  listDivisionCategories: async () => [{ slug: "pens" }],
  listProductCards: async () => [{ slug: "blue-pen", updatedAt: new Date("2026-09-10T00:00:00Z"), imageSrc: "https://cdn.example/blue-pen.jpg" }],
}));
vi.mock("@/features/content", () => ({
  listPublishedPages: async () => [{ slug: "delivery-guide", updatedAt: new Date("2026-09-01T00:00:00Z") }],
}));

describe("sitemap", () => {
  it("does not fake current modification dates for catalogue URLs", async () => {
    const { default: buildSitemap } = await import("./sitemap");
    const entries = await buildSitemap();
    const product = entries.find((entry) => entry.url.endsWith("/product/blue-pen"));
    const page = entries.find((entry) => entry.url.endsWith("/pages/delivery-guide"));

    expect(product).toMatchObject({ url: expect.stringContaining("/product/blue-pen"), changeFrequency: "weekly", lastModified: new Date("2026-09-10T00:00:00Z"), images: ["https://cdn.example/blue-pen.jpg"] });
    expect(page).toHaveProperty("lastModified");
  });
});
