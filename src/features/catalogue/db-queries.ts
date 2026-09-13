import { and, eq, inArray, isNull } from "drizzle-orm";
import { cache } from "react";
import { resolveUnitPrice } from "@/features/catalogue/pricing";
import { buildSpecLine, buildSupplementalSpecLine, matchesCatalogueQuery } from "@/features/catalogue/search";
import { storefrontDeliveryBadge } from "@/features/delivery/zones";
import {
  sellableQuantity,
  stockLevelFromQuantity,
} from "@/features/inventory/stock";
import { getDb } from "@/lib/db/client";
import { cloudinaryImageUrl } from "@/lib/cloudinary";
import {
  brands,
  categories,
  deliveryZones,
  inventory,
  priceTiers,
  productAliases,
  productAttributes,
  productImages,
  products,
  productVariants,
} from "@/lib/db/schema";
import type {
  CatalogueBrandView,
  CatalogueCategoryView,
  ProductCardModel,
  ProductDetailModel,
} from "@/types/catalogue";

type Filter = {
  categorySlug?: string;
  brandSlug?: string;
  query?: string;
};

function descendantIds(
  all: { id: string; parentId: string | null; slug: string }[],
  slug: string,
): string[] | null {
  const root = all.find((category) => category.slug === slug);
  if (!root) {
    return null;
  }

  const ids = new Set<string>([root.id]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const category of all) {
      if (category.parentId && ids.has(category.parentId) && !ids.has(category.id)) {
        ids.add(category.id);
        grew = true;
      }
    }
  }

  return [...ids];
}

const loadCatalogueContext = cache(async function loadCatalogueContext() {
  const db = getDb();
  const [categoryRows, brandRows, zoneRows, imageRows] = await Promise.all([
    db
      .select()
      .from(categories)
      .where(and(eq(categories.active, true), isNull(categories.deletedAt))),
    db
      .select()
      .from(brands)
      .where(and(eq(brands.active, true), isNull(brands.deletedAt))),
    db.select().from(deliveryZones).where(eq(deliveryZones.active, true)),
    db.select().from(productImages).orderBy(productImages.position),
  ]);

  return {
    categoryRows,
    brandRows,
    deliveryBadge: storefrontDeliveryBadge(zoneRows),
    imageRows,
  };
});

export async function listDivisionCategoriesFromDb(): Promise<CatalogueCategoryView[]> {
  const { categoryRows } = await loadCatalogueContext();
  return categoryRows
    .filter((category) => category.parentId === null)
    .sort((a, b) => a.position - b.position)
    .map((category) => ({
      id: category.id,
      parentId: category.parentId,
      name: category.name,
      slug: category.slug,
      caption: category.description ?? "",
      position: category.position,
      imagePublicId: category.imagePublicId,
    }));
}

export async function getCategoryBySlugFromDb(
  slug: string,
): Promise<CatalogueCategoryView | null> {
  const db = getDb();
  const [category] = await db
    .select()
    .from(categories)
    .where(
      and(
        eq(categories.slug, slug),
        eq(categories.active, true),
        isNull(categories.deletedAt),
      ),
    )
    .limit(1);

  if (!category) {
    return null;
  }

  return {
    id: category.id,
    parentId: category.parentId,
    name: category.name,
    slug: category.slug,
    caption: category.description ?? "",
    position: category.position,
    imagePublicId: category.imagePublicId,
  };
}

export async function listBrandsFromDb(): Promise<CatalogueBrandView[]> {
  const { brandRows } = await loadCatalogueContext();
  return brandRows.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
  }));
}

export async function getBrandBySlugFromDb(
  slug: string,
): Promise<CatalogueBrandView | null> {
  const db = getDb();
  const [brand] = await db
    .select()
    .from(brands)
    .where(
      and(eq(brands.slug, slug), eq(brands.active, true), isNull(brands.deletedAt)),
    )
    .limit(1);

  if (!brand) {
    return null;
  }

  return { id: brand.id, name: brand.name, slug: brand.slug };
}

async function loadActiveProducts() {
  const db = getDb();
  const { categoryRows, brandRows, deliveryBadge, imageRows } = await loadCatalogueContext();

  const productRows = await db
    .select({
      product: products,
      variant: productVariants,
      stock: inventory,
    })
    .from(products)
    .innerJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
    .where(
      and(
        eq(products.status, "active"),
        isNull(products.deletedAt),
        eq(productVariants.active, true),
      ),
    );

  const productIds = productRows.map((row) => row.product.id);
  const variantIds = productRows.map((row) => row.variant.id);

  const [attributeRows, aliasRows, tierRows] = productIds.length
    ? await Promise.all([
        db
          .select()
          .from(productAttributes)
          .where(inArray(productAttributes.productId, productIds)),
        db
          .select()
          .from(productAliases)
          .where(inArray(productAliases.productId, productIds)),
        db
          .select()
          .from(priceTiers)
          .where(
            and(
              inArray(priceTiers.variantId, variantIds),
              eq(priceTiers.active, true),
            ),
          ),
      ])
    : [[], [], []];

  return {
    categoryRows,
    brandRows,
    deliveryBadge,
    productRows,
    attributeRows,
    aliasRows,
    tierRows,
    imageRows,
  };
}

function toCardFromRow(
  row: Awaited<ReturnType<typeof loadActiveProducts>>["productRows"][number],
  ctx: Awaited<ReturnType<typeof loadActiveProducts>>,
): ProductCardModel {
  const attributes = ctx.attributeRows
    .filter((attribute) => attribute.productId === row.product.id)
    .sort((a, b) => a.position - b.position)
    .map((attribute) => ({
      namespace: attribute.namespace,
      key: attribute.key,
      valueText: attribute.valueText,
    }));
  const tiers = ctx.tierRows
    .filter((tier) => tier.variantId === row.variant.id)
    .map((tier) => ({
      minimumQuantity: tier.minimumQuantity,
      maximumQuantity: tier.maximumQuantity,
      unitPricePesewas: tier.unitPrice,
      requestQuote: tier.requestQuote,
    }));
  const list = resolveUnitPrice({
    quantity: 1,
    baseUnitPricePesewas: row.variant.baseUnitPrice,
    tiers,
  });
  const onHand = row.stock?.onHand ?? 0;
  const reserved = row.stock?.reserved ?? 0;
  const lowStockThreshold = row.stock?.lowStockThreshold ?? 5;
  const image = ctx.imageRows.find((entry) => entry.productId === row.product.id);

  return {
    id: row.product.id,
    variantId: row.variant.id,
    slug: row.product.slug,
    sku: row.variant.sku,
    name: row.product.name,
    specLine: buildSpecLine(attributes) || buildSupplementalSpecLine(attributes),
    unitLabel: row.variant.unitLabel,
    unitPricePesewas: list.unitPricePesewas ?? row.variant.baseUnitPrice,
    imageAlt: image?.alt ?? row.product.name,
    imageSrc: image ? cloudinaryImageUrl(image.cloudinaryPublicId, 1200) ?? undefined : undefined,
    stock: stockLevelFromQuantity(
      sellableQuantity(onHand, reserved),
      lowStockThreshold,
    ),
    tiers,
    deliveryBadge: ctx.deliveryBadge,
  };
}

function haystacksForRow(
  row: Awaited<ReturnType<typeof loadActiveProducts>>["productRows"][number],
  ctx: Awaited<ReturnType<typeof loadActiveProducts>>,
): string[] {
  const category = ctx.categoryRows.find((entry) => entry.id === row.product.categoryId);
  const division = category?.parentId
    ? ctx.categoryRows.find((entry) => entry.id === category.parentId)
    : category;
  const brand = ctx.brandRows.find((entry) => entry.id === row.product.brandId);
  const attributes = ctx.attributeRows.filter(
    (attribute) => attribute.productId === row.product.id,
  );
  const aliases = ctx.aliasRows.filter((alias) => alias.productId === row.product.id);

  return [
    row.product.name,
    row.variant.sku,
    row.variant.barcode ?? "",
    brand?.name ?? "",
    category?.name ?? "",
    division?.name ?? "",
    ...aliases.map((alias) => alias.alias),
    ...attributes.map((attribute) => attribute.valueText),
  ];
}

export async function listProductCardsFromDb(
  filter?: Filter,
): Promise<ProductCardModel[]> {
  const ctx = await loadActiveProducts();
  let rows = ctx.productRows;

  if (filter?.categorySlug) {
    const ids = descendantIds(ctx.categoryRows, filter.categorySlug);
    if (!ids) {
      return [];
    }
    rows = rows.filter((row) => ids.includes(row.product.categoryId));
  }

  if (filter?.brandSlug) {
    const brand = ctx.brandRows.find((entry) => entry.slug === filter.brandSlug);
    if (!brand) {
      return [];
    }
    rows = rows.filter((row) => row.product.brandId === brand.id);
  }

  if (filter?.query) {
    rows = rows.filter((row) =>
      matchesCatalogueQuery(haystacksForRow(row, ctx), filter.query ?? ""),
    );
  }

  return rows.map((row) => toCardFromRow(row, ctx));
}

export async function getProductBySlugFromDb(
  slug: string,
): Promise<ProductDetailModel | null> {
  const ctx = await loadActiveProducts();
  const row = ctx.productRows.find((entry) => entry.product.slug === slug);
  if (!row) {
    return null;
  }

  const category = ctx.categoryRows.find((entry) => entry.id === row.product.categoryId);
  const division = category?.parentId
    ? ctx.categoryRows.find((entry) => entry.id === category.parentId)
    : category;
  const brand = ctx.brandRows.find((entry) => entry.id === row.product.brandId);
  const attributes = ctx.attributeRows
    .filter((attribute) => attribute.productId === row.product.id)
    .sort((a, b) => a.position - b.position)
    .map((attribute) => ({
      namespace: attribute.namespace,
      key: attribute.key,
      valueText: attribute.valueText,
    }));
  const bundleContents = attributes
    .filter((attribute) => attribute.namespace === "bundle" && attribute.key === "item")
    .map((attribute) => attribute.valueText);
  const imageSources = ctx.imageRows
    .filter((image) => image.productId === row.product.id)
    .sort((a, b) => a.position - b.position)
    .map((image) => ({
      src: cloudinaryImageUrl(image.cloudinaryPublicId, 1200) ?? "",
      alt: image.alt,
    }))
    .filter((image) => image.src);

  return {
    ...toCardFromRow(row, ctx),
    imageSources: imageSources.length ? imageSources : undefined,
    barcode: row.variant.barcode,
    description: row.product.description ?? "",
    brandName: brand?.name ?? "PaperSource",
    brandSlug: brand?.slug ?? "papersource",
    categoryName: category?.name ?? "Shop",
    categorySlug: category?.slug ?? "shop",
    divisionName: division?.name ?? category?.name ?? "Shop",
    divisionSlug: division?.slug ?? category?.slug ?? "shop",
    attributes,
    bundleContents: bundleContents.length ? bundleContents : undefined,
    productType: row.product.productType,
  };
}

export async function listFeaturedProductCardsFromDb(): Promise<ProductCardModel[]> {
  const cards = await listProductCardsFromDb();
  return cards.slice(0, 4);
}
