import type { MetadataRoute } from "next";
import { canonicalCategorySlug, listBrandDirectory, listIndexableDivisionCategories, listProductCards } from "@/features/catalogue";
import { listPublishedPages } from "@/features/content";
import { SEO_GUIDES, seoGuideUrl } from "@/features/content/seo-guides";
import { SITE_URL } from "@/lib/seo";

// Product/category discovery changes through the admin catalogue, not on every
// request. Cache the generated sitemap for an hour to keep crawlers fast while
// still picking up catalogue edits promptly.
export const revalidate = 3600;

const publicRoutes = ["", "/shop", "/brands", "/about", "/contact", "/delivery", "/faq", "/returns", "/privacy", "/terms", "/business", "/schools", "/corporate-accounts", "/bulk-orders", "/guides"];
const SITEMAP_DATA_TIMEOUT_MS = 8_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      const timer = setTimeout(() => reject(new Error("Sitemap data timed out.")), timeoutMs);
      promise.finally(() => clearTimeout(timer)).catch(() => undefined);
    }),
  ]);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = publicRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "/shop" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.6,
  }));

  try {
    const [categories, brands, products, pages] = await withTimeout(Promise.all([
      listIndexableDivisionCategories(),
      listBrandDirectory(),
      listProductCards(),
      listPublishedPages(),
    ]), SITEMAP_DATA_TIMEOUT_MS);
    entries.push(
      ...categories.map((category) => ({ url: `${SITE_URL}/shop/${canonicalCategorySlug(category.slug)}`, changeFrequency: "daily" as const, priority: 0.8 })),
      ...brands.map((brand) => ({ url: `${SITE_URL}/brands/${brand.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
      ...products.map((product) => ({
        url: `${SITE_URL}/product/${product.slug}`,
        ...(product.updatedAt ? { lastModified: product.updatedAt } : {}),
        ...(product.imageSrc ? { images: [product.imageSrc] } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...pages.map((page) => ({ url: `${SITE_URL}/pages/${page.slug}`, lastModified: page.updatedAt, changeFrequency: "monthly" as const, priority: 0.5 })),
      ...SEO_GUIDES.map((guide) => ({ url: seoGuideUrl(guide.slug), changeFrequency: "monthly" as const, priority: 0.6 })),
    );
  } catch {
    // Keep the static storefront discoverable if the catalogue database is temporarily unavailable.
  }

  // Keep one canonical sitemap entry per URL even if an import or taxonomy
  // query temporarily returns duplicate catalogue records.
  const uniqueEntries = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of entries) {
    if (!uniqueEntries.has(entry.url)) uniqueEntries.set(entry.url, entry);
  }
  return [...uniqueEntries.values()];
}
