import { resolveUnitPrice } from "@/features/catalogue/pricing";
import {
  seedBrands,
  seedCategories,
  seedDeliveryZones,
  seedProducts,
  shopMegaColumns,
  type SeedProduct,
} from "@/features/catalogue/local-data";
import { buildSpecLine, matchesCatalogueQuery } from "@/features/catalogue/search";
import { storefrontDeliveryBadge } from "@/features/delivery/zones";
import {
  sellableQuantity,
  stockLevelFromQuantity,
} from "@/features/inventory/stock";
import { seedUuid } from "@/lib/db/seed-ids";
import type {
  CatalogueBrandView,
  CatalogueCategoryView,
  ProductCardModel,
  ProductDetailModel,
} from "@/types/catalogue";

const deliveryBadge = storefrontDeliveryBadge(seedDeliveryZones);

function categoryById(id: string) {
  return seedCategories.find((category) => category.id === id);
}

function brandById(id: string) {
  return seedBrands.find((brand) => brand.id === id);
}

function descendantCategoryIds(slug: string): string[] | null {
  const root = seedCategories.find((category) => category.slug === slug);

  if (!root) {
    return null;
  }

  const ids = new Set<string>([root.id]);
  for (const category of seedCategories) {
    if (category.parentId && ids.has(category.parentId)) {
      ids.add(category.id);
    }
  }

  return [...ids];
}

function toCard(product: SeedProduct): ProductCardModel {
  const list = resolveUnitPrice({
    quantity: 1,
    baseUnitPricePesewas: product.baseUnitPricePesewas,
    tiers: product.tiers,
  });

  return {
    id: seedUuid("product", product.slug),
    variantId: seedUuid("variant", product.sku),
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    specLine: buildSpecLine(product.attributes) || product.name,
    unitLabel: product.unitLabel,
    unitPricePesewas: list.unitPricePesewas ?? product.baseUnitPricePesewas,
    imageAlt: product.imageAlt,
    stock: stockLevelFromQuantity(
      sellableQuantity(product.onHand, product.reserved),
      product.lowStockThreshold,
    ),
    tiers: product.tiers.map((tier) => ({
      minimumQuantity: tier.minimumQuantity,
      maximumQuantity: tier.maximumQuantity,
      unitPricePesewas: tier.unitPricePesewas,
      requestQuote: tier.requestQuote,
    })),
    deliveryBadge,
  };
}

function toDetail(product: SeedProduct): ProductDetailModel {
  const category = categoryById(product.categoryId);
  const brand = brandById(product.brandId);
  const division = category?.parentId
    ? categoryById(category.parentId)
    : category;

  return {
    ...toCard(product),
    barcode: product.barcode,
    description: product.description,
    brandName: brand?.name ?? "PaperSource",
    brandSlug: brand?.slug ?? "papersource",
    categoryName: category?.name ?? "Shop",
    categorySlug: category?.slug ?? "shop",
    divisionName: division?.name ?? category?.name ?? "Shop",
    divisionSlug: division?.slug ?? category?.slug ?? "shop",
    attributes: product.attributes,
    bundleContents: product.bundleContents,
    productType: product.productType,
  };
}

function productHaystacks(product: SeedProduct): string[] {
  const brand = brandById(product.brandId);
  const category = categoryById(product.categoryId);
  const division = category?.parentId
    ? categoryById(category.parentId)
    : category;

  return [
    product.name,
    product.sku,
    product.barcode ?? "",
    brand?.name ?? "",
    category?.name ?? "",
    division?.name ?? "",
    ...product.aliases,
    ...product.attributes.map((attribute) => attribute.valueText),
  ];
}

export function listDivisionCategoriesFromSeed(): CatalogueCategoryView[] {
  return seedCategories
    .filter((category) => category.parentId === null)
    .sort((a, b) => a.position - b.position)
    .map((category) => ({
      id: seedUuid("category", category.slug),
      parentId: null,
      name: category.name,
      slug: category.slug,
      caption: category.caption,
      position: category.position,
    }));
}

export function getShopMegaColumns() {
  return shopMegaColumns;
}

export function getCategoryBySlugFromSeed(slug: string): CatalogueCategoryView | null {
  const category = seedCategories.find((entry) => entry.slug === slug);
  if (!category) {
    return null;
  }

  return {
    id: seedUuid("category", category.slug),
    parentId: category.parentId
      ? seedUuid("category", category.parentId)
      : null,
    name: category.name,
    slug: category.slug,
    caption: category.caption,
    position: category.position,
  };
}

export function listBrandsFromSeed(): CatalogueBrandView[] {
  return seedBrands.map((brand) => ({
    id: seedUuid("brand", brand.slug),
    name: brand.name,
    slug: brand.slug,
  }));
}

export function getBrandBySlugFromSeed(slug: string): CatalogueBrandView | null {
  const brand = seedBrands.find((entry) => entry.slug === slug);
  if (!brand) {
    return null;
  }

  return {
    id: seedUuid("brand", brand.slug),
    name: brand.name,
    slug: brand.slug,
  };
}

export function listProductCardsFromSeed(filter?: {
  categorySlug?: string;
  brandSlug?: string;
  query?: string;
}): ProductCardModel[] {
  let products = seedProducts;

  if (filter?.categorySlug) {
    const ids = descendantCategoryIds(filter.categorySlug);
    if (!ids) {
      return [];
    }
    products = products.filter((product) => ids.includes(product.categoryId));
  }

  if (filter?.brandSlug) {
    const brand = seedBrands.find((entry) => entry.slug === filter.brandSlug);
    if (!brand) {
      return [];
    }
    products = products.filter((product) => product.brandId === brand.id);
  }

  if (filter?.query) {
    products = products.filter((product) =>
      matchesCatalogueQuery(productHaystacks(product), filter.query ?? ""),
    );
  }

  return products.map(toCard);
}

export function getProductBySlugFromSeed(slug: string): ProductDetailModel | null {
  const product = seedProducts.find((entry) => entry.slug === slug);
  return product ? toDetail(product) : null;
}

export function listFeaturedProductCardsFromSeed(): ProductCardModel[] {
  return listProductCardsFromSeed().slice(0, 4);
}
