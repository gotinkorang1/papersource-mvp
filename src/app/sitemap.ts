import type { MetadataRoute } from "next";
import { listBrands, listDivisionCategories, listProductCards } from "@/features/catalogue";
import { listPublishedPages } from "@/features/content";
import { SITE_URL } from "@/lib/seo";

// Product/category discovery changes through the admin catalogue, not on every
// request. Cache the generated sitemap for an hour to keep crawlers fast while
// still picking up catalogue edits promptly.
export const revalidate = 3600;

const publicRoutes = ["", "/shop", "/brands", "/about", "/contact", "/delivery", "/faq", "/returns", "/privacy", "/terms", "/business", "/schools", "/corporate-accounts", "/bulk-orders"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = publicRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "/shop" ? "daily" : "weekly",
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
      ...categories.map((category) => ({ url: `${SITE_URL}/shop/${category.slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
      ...brands.map((brand) => ({ url: `${SITE_URL}/brands/${brand.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
      ...products.map((product) => ({
        url: `${SITE_URL}/product/${product.slug}`,
        ...(product.updatedAt ? { lastModified: product.updatedAt } : {}),
        ...(product.imageSrc ? { images: [product.imageSrc] } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...pages.map((page) => ({ url: `${SITE_URL}/pages/${page.slug}`, lastModified: page.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
    );
  } catch {
    // Keep the static storefront discoverable if the catalogue database is temporarily unavailable.
  }

  return entries;
}
