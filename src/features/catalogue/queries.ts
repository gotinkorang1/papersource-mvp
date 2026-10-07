import { isDatabaseConfigured } from "@/lib/db/client";
import { cache } from "react";
import {
  getBrandBySlugFromDb,
  getCategoryBySlugFromDb,
  getProductBySlugFromDb,
  listBrandsFromDb,
  listBrandDirectoryFromDb,
  listDivisionCategoriesFromDb,
  listIndexableDivisionCategoriesFromDb,
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
  listIndexableDivisionCategoriesFromSeed,
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

// Server components can request the same catalogue slice more than once in a
// render (for example a page shell and a recommendation block). React's
// request cache deduplicates that work before the longer-lived database cache
// is consulted. Primitive arguments keep equivalent filter objects shareable.
const listProductCardsRequestCached = cache(async (
  categorySlug?: string,
  brandSlug?: string,
  query?: string,
) => listProductCardsFromDb({ categorySlug, brandSlug, query }));

const listDivisionCategoriesRequestCached = cache(async () =>
  isDatabaseConfigured() ? listDivisionCategoriesFromDb() : listDivisionCategoriesFromSeed(),
);
const listIndexableDivisionCategoriesRequestCached = cache(async () =>
  isDatabaseConfigured() ? listIndexableDivisionCategoriesFromDb() : listIndexableDivisionCategoriesFromSeed(),
);
const listBrandsRequestCached = cache(async () =>
  isDatabaseConfigured() ? listBrandsFromDb() : listBrandsFromSeed(),
);
const listBrandDirectoryRequestCached = cache(async () =>
  isDatabaseConfigured() ? listBrandDirectoryFromDb() : listBrandDirectoryFromSeed(),
);
const listFeaturedProductCardsRequestCached = cache(async () =>
  isDatabaseConfigured() ? listFeaturedProductCardsFromDb() : listFeaturedProductCardsFromSeed(),
);

export async function listDivisionCategories(): Promise<CatalogueCategoryView[]> {
  return listDivisionCategoriesRequestCached();
}

export async function listIndexableDivisionCategories(): Promise<CatalogueCategoryView[]> {
  return listIndexableDivisionCategoriesRequestCached();
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
  return listBrandsRequestCached();
}

export async function listBrandDirectory() {
  return listBrandDirectoryRequestCached();
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
    return listProductCardsRequestCached(filter?.categorySlug, filter?.brandSlug, filter?.query);
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
  return listFeaturedProductCardsRequestCached();
}
