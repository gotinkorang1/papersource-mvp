import { isDatabaseConfigured } from "@/lib/db/client";
import {
  getBrandBySlugFromDb,
  getCategoryBySlugFromDb,
  getProductBySlugFromDb,
  listBrandsFromDb,
  listBrandDirectoryFromDb,
  listDivisionCategoriesFromDb,
  listFeaturedProductCardsFromDb,
  listProductCardsFromDb,
} from "./db-queries";
import {
  getBrandBySlugFromSeed,
  getCategoryBySlugFromSeed,
  getProductBySlugFromSeed,
  getShopMegaColumns,
  listBrandsFromSeed,
  listBrandDirectoryFromSeed,
  listDivisionCategoriesFromSeed,
  listFeaturedProductCardsFromSeed,
  listProductCardsFromSeed,
} from "./seed-queries";
import type {
  CatalogueBrandView,
  CatalogueCategoryView,
  ProductCardModel,
  ProductDetailModel,
} from "@/types/catalogue";

export { getShopMegaColumns, listProductCardsFromSeed };

// Compatibility aliases keep indexable and previously shared category URLs
// working even when the imported catalogue uses broader divisions.
const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  paper: "paper-printing",
  writing: "writing-marking",
  "school-supplies": "school-supplies",
  "office-supplies": "office-equipment",
  "printer-supplies": "paper-printing",
  toner: "paper-printing",
  ink: "paper-printing",
  "desk-essentials": "desk-accessories",
};

/** Resolves a previously shared category path to its current database slug. */
export function canonicalCategorySlug(slug: string) {
  return CATEGORY_SLUG_ALIASES[slug] ?? slug;
}

type ProductFilter = {
  categorySlug?: string;
  brandSlug?: string;
  query?: string;
};

export async function listDivisionCategories(): Promise<CatalogueCategoryView[]> {
  if (isDatabaseConfigured()) {
    return listDivisionCategoriesFromDb();
  }
  return listDivisionCategoriesFromSeed();
}

export async function getCategoryBySlug(
  slug: string,
): Promise<CatalogueCategoryView | null> {
  if (isDatabaseConfigured()) {
    const category = await getCategoryBySlugFromDb(slug);
    if (category) return category;
    const alias = canonicalCategorySlug(slug);
    return alias !== slug ? getCategoryBySlugFromDb(alias) : null;
  }
  return getCategoryBySlugFromSeed(slug);
}

export async function listBrands(): Promise<CatalogueBrandView[]> {
  if (isDatabaseConfigured()) {
    return listBrandsFromDb();
  }
  return listBrandsFromSeed();
}

export async function listBrandDirectory() {
  if (isDatabaseConfigured()) return listBrandDirectoryFromDb();
  return listBrandDirectoryFromSeed();
}

export async function getBrandBySlug(
  slug: string,
): Promise<CatalogueBrandView | null> {
  if (isDatabaseConfigured()) {
    return getBrandBySlugFromDb(slug);
  }
  return getBrandBySlugFromSeed(slug);
}

export async function listProductCards(
  filter?: ProductFilter,
): Promise<ProductCardModel[]> {
  if (isDatabaseConfigured()) {
    return listProductCardsFromDb(filter);
  }
  return listProductCardsFromSeed(filter);
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetailModel | null> {
  if (isDatabaseConfigured()) {
    return getProductBySlugFromDb(slug);
  }
  return getProductBySlugFromSeed(slug);
}

export async function listFeaturedProductCards(): Promise<ProductCardModel[]> {
  if (isDatabaseConfigured()) {
    return listFeaturedProductCardsFromDb();
  }
  return listFeaturedProductCardsFromSeed();
}
