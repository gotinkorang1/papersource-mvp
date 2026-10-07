import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { resolveUnitPrice } from "@/features/catalogue/pricing";
import { productImageAlt } from "@/features/catalogue/product-metadata";
import { decorateProductPresentation } from "@/features/catalogue/presentation";
import { listTrendingProductIds } from "@/features/catalogue/trending";
import { buildSpecLine, buildSupplementalSpecLine, matchesCatalogueQuery, uniqueCatalogueProducts } from "@/features/catalogue/search";
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

const loadCatalogueContext = unstable_cache(async function loadCatalogueContext() {
  const db = getDb();
  const [categoryRows, brandRows, zoneRows] = await Promise.all([
    db
      .select({ id: categories.id, parentId: categories.parentId, name: categories.name, slug: categories.slug, description: categories.description, position: categories.position, imagePublicId: categories.imagePublicId })
      .from(categories)
      .where(and(eq(categories.active, true), isNull(categories.deletedAt))),
    db
      .select({ id: brands.id, name: brands.name, slug: brands.slug })
      .from(brands)
      .where(and(eq(brands.active, true), isNull(brands.deletedAt))),
    db.select({ code: deliveryZones.code, name: deliveryZones.name, region: deliveryZones.region, feeMode: deliveryZones.feeMode, active: deliveryZones.active }).from(deliveryZones).where(eq(deliveryZones.active, true)),
  ]);

  return {
    categoryRows,
    brandRows,
    deliveryBadge: storefrontDeliveryBadge(zoneRows),
  };
}, ["catalogue-context"], { revalidate: 300, tags: ["catalogue"] });

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

/**
 * Returns only top-level categories that contain at least one active,
 * sellable product. Keeping this separate from the storefront directory
 * prevents an empty admin-created category from being emitted in the sitemap.
 */
const loadIndexableDivisionCategories = unstable_cache(async function loadIndexableDivisionCategories() {
  const { categoryRows } = await loadCatalogueContext();
  const db = getDb();
  const productRows = await db
    .select({ categoryId: products.categoryId })
    .from(products)
    .innerJoin(productVariants, eq(productVariants.productId, products.id))
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(
      and(
        eq(products.status, "active"),
        isNull(products.deletedAt),
        eq(productVariants.active, true),
        eq(categories.active, true),
        isNull(categories.deletedAt),
      ),
    );

  const productCategoryIds = new Set(productRows.map((row) => row.categoryId));
  const indexableRootIds = new Set<string>();
  for (const category of categoryRows) {
    if (!productCategoryIds.has(category.id)) continue;
    let current: typeof category | undefined = category;
    while (current) {
      if (current.parentId === null) {
        indexableRootIds.add(current.id);
        break;
      }
      current = categoryRows.find((candidate) => candidate.id === current?.parentId);
    }
  }

  return categoryRows
    .filter((category) => category.parentId === null && indexableRootIds.has(category.id))
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
}, ["catalogue-indexable-divisions"], { revalidate: 300, tags: ["catalogue"] });

export async function listIndexableDivisionCategoriesFromDb(): Promise<CatalogueCategoryView[]> {
  return loadIndexableDivisionCategories();
}

const loadCategoryBySlug = unstable_cache(async function loadCategoryBySlug(slug: string) {
  const db = getDb();
  const [category] = await db
    .select({ id: categories.id, parentId: categories.parentId, name: categories.name, slug: categories.slug, description: categories.description, position: categories.position, imagePublicId: categories.imagePublicId })
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
}, ["catalogue-category-by-slug"], { revalidate: 300, tags: ["catalogue"] });

export async function getCategoryBySlugFromDb(
  slug: string,
): Promise<CatalogueCategoryView | null> {
  return loadCategoryBySlug(slug);
}

export async function listBrandsFromDb(): Promise<CatalogueBrandView[]> {
  const { brandRows } = await loadCatalogueContext();
  return brandRows.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
  }));
}

const loadBrandBySlug = unstable_cache(async function loadBrandBySlug(slug: string) {
  const db = getDb();
  const [brand] = await db
    .select({ id: brands.id, name: brands.name, slug: brands.slug })
    .from(brands)
    .where(
      and(eq(brands.slug, slug), eq(brands.active, true), isNull(brands.deletedAt)),
    )
    .limit(1);

  if (!brand) {
    return null;
  }

  return { id: brand.id, name: brand.name, slug: brand.slug };
}, ["catalogue-brand-by-slug"], { revalidate: 300, tags: ["catalogue"] });

export async function getBrandBySlugFromDb(
  slug: string,
): Promise<CatalogueBrandView | null> {
  return loadBrandBySlug(slug);
}

const loadActiveProducts = unstable_cache(async function loadActiveProducts() {
  const db = getDb();
  const { categoryRows, brandRows, deliveryBadge } = await loadCatalogueContext();

  const productRows = uniqueCatalogueProducts(await db
    .select({
      product: { id: products.id, name: products.name, slug: products.slug, brandId: products.brandId, categoryId: products.categoryId, productType: products.productType, description: products.description, createdAt: products.createdAt, updatedAt: products.updatedAt },
      variant: { id: productVariants.id, productId: productVariants.productId, sku: productVariants.sku, barcode: productVariants.barcode, unitLabel: productVariants.unitLabel, baseUnitPrice: productVariants.baseUnitPrice, active: productVariants.active },
      stock: { variantId: inventory.variantId, onHand: inventory.onHand, reserved: inventory.reserved, lowStockThreshold: inventory.lowStockThreshold },
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
    ));

  const productIds = productRows.map((row) => row.product.id);
  const variantIds = productRows.map((row) => row.variant.id);

  const [attributeRows, aliasRows, tierRows, imageRows] = productIds.length
    ? await Promise.all([
        db
          .select({ productId: productAttributes.productId, namespace: productAttributes.namespace, key: productAttributes.key, valueText: productAttributes.valueText, position: productAttributes.position })
          .from(productAttributes)
          .where(inArray(productAttributes.productId, productIds)),
        db
          .select({ productId: productAliases.productId, alias: productAliases.alias })
          .from(productAliases)
          .where(inArray(productAliases.productId, productIds)),
        db
          .select({ variantId: priceTiers.variantId, minimumQuantity: priceTiers.minimumQuantity, maximumQuantity: priceTiers.maximumQuantity, unitPrice: priceTiers.unitPrice, requestQuote: priceTiers.requestQuote })
          .from(priceTiers)
          .where(
            and(
              inArray(priceTiers.variantId, variantIds),
              eq(priceTiers.active, true),
            ),
          ),
        db
          .selectDistinctOn([productImages.productId], { id: productImages.id, productId: productImages.productId, cloudinaryPublicId: productImages.cloudinaryPublicId, alt: productImages.alt, position: productImages.position })
          .from(productImages)
          .where(inArray(productImages.productId, productIds))
          .orderBy(asc(productImages.productId), asc(productImages.position), asc(productImages.id)),
      ])
    : [[], [], [], []];

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
}, ["catalogue-active-products"], { revalidate: 300, tags: ["catalogue"] });

type ActiveProductsContext = Awaited<ReturnType<typeof loadActiveProducts>>;
type CatalogueIndexes = {
  categoryById: Map<string, ActiveProductsContext["categoryRows"][number]>;
  brandById: Map<string, ActiveProductsContext["brandRows"][number]>;
  brandBySlug: Map<string, ActiveProductsContext["brandRows"][number]>;
  attributesByProductId: Map<string, ActiveProductsContext["attributeRows"]>;
  aliasesByProductId: Map<string, ActiveProductsContext["aliasRows"]>;
  tiersByVariantId: Map<string, ActiveProductsContext["tierRows"]>;
  imageByProductId: Map<string, ActiveProductsContext["imageRows"][number]>;
};

function indexCatalogueContext(ctx: ActiveProductsContext): CatalogueIndexes {
  const attributesByProductId = new Map<string, ActiveProductsContext["attributeRows"]>();
  for (const row of ctx.attributeRows) {
    const entries = attributesByProductId.get(row.productId) ?? [];
    entries.push(row);
    attributesByProductId.set(row.productId, entries);
  }
  const aliasesByProductId = new Map<string, ActiveProductsContext["aliasRows"]>();
  for (const row of ctx.aliasRows) {
    const entries = aliasesByProductId.get(row.productId) ?? [];
    entries.push(row);
    aliasesByProductId.set(row.productId, entries);
  }
  const tiersByVariantId = new Map<string, ActiveProductsContext["tierRows"]>();
  for (const row of ctx.tierRows) {
    const entries = tiersByVariantId.get(row.variantId) ?? [];
    entries.push(row);
    tiersByVariantId.set(row.variantId, entries);
  }
  return {
    categoryById: new Map(ctx.categoryRows.map((row) => [row.id, row])),
    brandById: new Map(ctx.brandRows.map((row) => [row.id, row])),
    brandBySlug: new Map(ctx.brandRows.map((row) => [row.slug, row])),
    attributesByProductId,
    aliasesByProductId,
    tiersByVariantId,
    imageByProductId: new Map(ctx.imageRows.map((row) => [row.productId, row])),
  };
}

const loadProductDetailContext = unstable_cache(async function loadProductDetailContext(slug: string) {
  const db = getDb();
  const { categoryRows, brandRows, deliveryBadge } = await loadCatalogueContext();
  const [row] = await db
    .select({
      product: { id: products.id, name: products.name, slug: products.slug, brandId: products.brandId, categoryId: products.categoryId, productType: products.productType, description: products.description, createdAt: products.createdAt, updatedAt: products.updatedAt },
      variant: { id: productVariants.id, productId: productVariants.productId, sku: productVariants.sku, barcode: productVariants.barcode, unitLabel: productVariants.unitLabel, baseUnitPrice: productVariants.baseUnitPrice, active: productVariants.active },
      stock: { variantId: inventory.variantId, onHand: inventory.onHand, reserved: inventory.reserved, lowStockThreshold: inventory.lowStockThreshold },
    })
    .from(products)
    .innerJoin(productVariants, eq(productVariants.productId, products.id))
    .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
    .where(and(eq(products.slug, slug), eq(products.status, "active"), isNull(products.deletedAt), eq(productVariants.active, true)))
    .limit(1);

  if (!row) return null;

  const [attributeRows, aliasRows, tierRows, imageRows] = await Promise.all([
    db
      .select({ productId: productAttributes.productId, namespace: productAttributes.namespace, key: productAttributes.key, valueText: productAttributes.valueText, position: productAttributes.position })
      .from(productAttributes)
      .where(eq(productAttributes.productId, row.product.id)),
    db
      .select({ productId: productAliases.productId, alias: productAliases.alias })
      .from(productAliases)
      .where(eq(productAliases.productId, row.product.id)),
    db
      .select({ variantId: priceTiers.variantId, minimumQuantity: priceTiers.minimumQuantity, maximumQuantity: priceTiers.maximumQuantity, unitPrice: priceTiers.unitPrice, requestQuote: priceTiers.requestQuote })
      .from(priceTiers)
      .where(and(eq(priceTiers.variantId, row.variant.id), eq(priceTiers.active, true))),
    db
      .select({ id: productImages.id, productId: productImages.productId, cloudinaryPublicId: productImages.cloudinaryPublicId, alt: productImages.alt, position: productImages.position })
      .from(productImages)
      .where(eq(productImages.productId, row.product.id))
      .orderBy(asc(productImages.position), asc(productImages.id)),
  ]);

  return { categoryRows, brandRows, deliveryBadge, productRows: [row], attributeRows, aliasRows, tierRows, imageRows };
}, ["catalogue-product-detail"], { revalidate: 300, tags: ["catalogue"] });

const loadBrandDirectory = unstable_cache(async function loadBrandDirectory() {
  const db = getDb();
  const rows = await db
    .select({
      brandId: brands.id,
      brandName: brands.name,
      brandSlug: brands.slug,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(brands)
    .innerJoin(products, eq(products.brandId, brands.id))
    .innerJoin(productVariants, eq(productVariants.productId, products.id))
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(
      and(
        eq(brands.active, true),
        isNull(brands.deletedAt),
        eq(products.status, "active"),
        isNull(products.deletedAt),
        eq(productVariants.active, true),
        eq(categories.active, true),
        isNull(categories.deletedAt),
      ),
    );
  const directory = new Map<string, { id: string; name: string; slug: string; categories: { name: string; slug: string }[] }>();
  for (const row of rows) {
    const entry = directory.get(row.brandId) ?? { id: row.brandId, name: row.brandName, slug: row.brandSlug, categories: [] };
    if (!entry.categories.some((category) => category.slug === row.categorySlug)) entry.categories.push({ name: row.categoryName, slug: row.categorySlug });
    directory.set(row.brandId, entry);
  }
  return [...directory.values()];
}, ["catalogue-brand-directory"], { revalidate: 300, tags: ["catalogue"] });

export async function listBrandDirectoryFromDb() {
  return loadBrandDirectory();
}

function toCardFromRow(
  row: Awaited<ReturnType<typeof loadActiveProducts>>["productRows"][number],
  ctx: Awaited<ReturnType<typeof loadActiveProducts>>,
  indexes: CatalogueIndexes,
): ProductCardModel {
  const attributes = [...(indexes.attributesByProductId.get(row.product.id) ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((attribute) => ({
      namespace: attribute.namespace,
      key: attribute.key,
      valueText: attribute.valueText,
    }));
  const tiers = (indexes.tiersByVariantId.get(row.variant.id) ?? [])
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
  const image = indexes.imageByProductId.get(row.product.id);

  return decorateProductPresentation({
    id: row.product.id,
    variantId: row.variant.id,
    slug: row.product.slug,
    sku: row.variant.sku,
    name: row.product.name,
    specLine: buildSpecLine(attributes) || buildSupplementalSpecLine(attributes),
    unitLabel: row.variant.unitLabel,
    unitPricePesewas: list.unitPricePesewas ?? row.variant.baseUnitPrice,
    imageAlt: productImageAlt({ name: row.product.name, specLine: buildSpecLine(attributes) || buildSupplementalSpecLine(attributes), alt: image?.alt }),
    // Cards are rendered in a small grid/list slot. Keep the source transform
    // close to the largest rendered slot so Cloudinary and Next do not move a
    // full 1200px image through the request path for every catalogue card.
    imageSrc: image ? cloudinaryImageUrl(image.cloudinaryPublicId, 640) ?? undefined : undefined,
    stock: stockLevelFromQuantity(
      sellableQuantity(onHand, reserved),
      lowStockThreshold,
    ),
    tiers,
    deliveryBadge: ctx.deliveryBadge,
    createdAt: row.product.createdAt,
    updatedAt: row.product.updatedAt,
  });
}

function haystacksForRow(
  row: Awaited<ReturnType<typeof loadActiveProducts>>["productRows"][number],
  ctx: Awaited<ReturnType<typeof loadActiveProducts>>,
  indexes: CatalogueIndexes,
): string[] {
  const category = indexes.categoryById.get(row.product.categoryId);
  const division = category?.parentId
    ? indexes.categoryById.get(category.parentId)
    : category;
  const brand = indexes.brandById.get(row.product.brandId);
  const attributes = indexes.attributesByProductId.get(row.product.id) ?? [];
  const aliases = indexes.aliasesByProductId.get(row.product.id) ?? [];

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
  const indexes = indexCatalogueContext(ctx);
  let rows = ctx.productRows;

  if (filter?.categorySlug) {
    const ids = descendantIds(ctx.categoryRows, filter.categorySlug);
    if (!ids) {
      return [];
    }
    const categoryIds = new Set(ids);
    rows = rows.filter((row) => categoryIds.has(row.product.categoryId));
  }

  if (filter?.brandSlug) {
    const brand = indexes.brandBySlug.get(filter.brandSlug);
    if (!brand) {
      return [];
    }
    rows = rows.filter((row) => row.product.brandId === brand.id);
  }

  if (filter?.query) {
    rows = rows.filter((row) =>
      matchesCatalogueQuery(haystacksForRow(row, ctx, indexes), filter.query ?? ""),
    );
  }

  const cards = rows.map((row) => toCardFromRow(row, ctx, indexes));
  let trending = new Map<string, number>();
  try {
    trending = await listTrendingProductIds(cards.map((card) => card.id));
  } catch {
    // Trend analytics are additive; a missing or temporarily unavailable events table must not break the catalogue.
  }
  const trendingIds = new Set(
    [...trending.entries()]
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id),
  );
  return cards.map((card) => ({
    ...card,
    viewCount: trending.get(card.id),
    isTrending: trendingIds.has(card.id),
  }));
}

export async function getProductBySlugFromDb(
  slug: string,
): Promise<ProductDetailModel | null> {
  const ctx = await loadProductDetailContext(slug);
  if (!ctx) return null;
  const row = ctx.productRows[0];
  const indexes = indexCatalogueContext(ctx);

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
  const seenImageSources = new Set<string>();
  const imageSources = ctx.imageRows
    .map((image) => ({
      src: cloudinaryImageUrl(image.cloudinaryPublicId, 1200) ?? "",
      alt: productImageAlt({ name: row.product.name, specLine: buildSpecLine(attributes) || buildSupplementalSpecLine(attributes), alt: image.alt }),
    }))
    .filter((image) => {
      if (!image.src || seenImageSources.has(image.src)) return false;
      seenImageSources.add(image.src);
      return true;
    });

  return {
    ...toCardFromRow(row, ctx, indexes),
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
