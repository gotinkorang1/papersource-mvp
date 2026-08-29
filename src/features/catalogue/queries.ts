import { isDatabaseConfigured } from "@/lib/db/client";
import {
  getBrandBySlugFromDb,
  getCategoryBySlugFromDb,
  getProductBySlugFromDb,
  listBrandsFromDb,
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
    return getCategoryBySlugFromDb(slug);
  }
  return getCategoryBySlugFromSeed(slug);
}

export async function listBrands(): Promise<CatalogueBrandView[]> {
  if (isDatabaseConfigured()) {
    return listBrandsFromDb();
  }
  return listBrandsFromSeed();
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
