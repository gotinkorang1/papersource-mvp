import type { MetadataRoute } from "next";
import { listBrands, listDivisionCategories, listProductCards } from "@/features/catalogue";
import { listPublishedPages } from "@/features/content";
import { SITE_URL } from "@/lib/seo";

const publicRoutes = ["", "/shop", "/brands", "/search", "/about", "/contact", "/delivery", "/faq", "/returns", "/privacy", "/terms", "/business", "/schools", "/corporate-accounts", "/bulk-orders", "/quick-order"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = publicRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "/shop" || path === "/search" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.6,
  }));

  try {
    const [categories, brands, products, pages] = await Promise.all([
      listDivisionCategories(),
      listBrands(),
      listProductCards(),
      listPublishedPages(),
    ]);
    entries.push(
      ...categories.map((category) => ({ url: `${SITE_URL}/shop/${category.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
      ...brands.map((brand) => ({ url: `${SITE_URL}/brands/${brand.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 })),
      ...products.map((product) => ({ url: `${SITE_URL}/product/${product.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 })),
      ...pages.map((page) => ({ url: `${SITE_URL}/pages/${page.slug}`, lastModified: page.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
    );
  } catch {
    // Keep the static storefront discoverable if the catalogue database is temporarily unavailable.
  }

  return entries;
}
