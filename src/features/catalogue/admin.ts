import { and, asc, count, desc, eq, exists, ilike, inArray, isNull, or } from "drizzle-orm";
import { refreshProductSearchDocument } from "@/features/catalogue/refresh-search";
import { getDb } from "@/lib/db/client";
import { parseGhsToPesewas } from "@/lib/money";
import { slugify } from "@/lib/slug";
import {
  brands,
  categories,
  inventory,
  priceTiers,
  productAliases,
  productAttributes,
  productBundleItems,
  productImages,
  products,
  productVariants,
} from "@/lib/db/schema";
import type { StaffRole } from "@/lib/staff/types";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { destroyCloudinaryImage } from "@/lib/cloudinary/server";
import { parseOpeningInventory } from "@/features/inventory/admin";
import { ADMIN_PRODUCT_PAGE_SIZE, resolveAdminProductPage } from "./admin-pagination";

export class CatalogueAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CatalogueAdminError";
  }
}

function assertProductsWrite(role: StaffRole) {
  if (!canAccessAdmin(role, "products", "write")) {
    throw new CatalogueAdminError("This role cannot change catalogue content.");
  }
}

function assertPricingWrite(role: StaffRole) {
  if (!canAccessAdmin(role, "pricing", "write")) {
    throw new CatalogueAdminError("This role cannot change list prices or tiers.");
  }
}

function assertTaxonomyWrite(role: StaffRole, area: "categories" | "brands") {
  if (!canAccessAdmin(role, area, "write")) {
    throw new CatalogueAdminError("This role cannot change that taxonomy.");
  }
}

export async function listAdminProducts(filters?: { search?: string; status?: string; sort?: string; page?: string }) {
  const db = getDb();
  const search = filters?.search?.trim();
  const where = and(
    isNull(products.deletedAt),
    search ? or(ilike(products.name, `%${search}%`), ilike(products.slug, `%${search}%`), ilike(brands.name, `%${search}%`), ilike(categories.name, `%${search}%`), exists(db.select({ id: productVariants.id }).from(productVariants).where(and(eq(productVariants.productId, products.id), ilike(productVariants.sku, `%${search}%`))))) : undefined,
    filters?.status && ["draft", "active", "archived"].includes(filters.status) ? eq(products.status, filters.status as "draft" | "active" | "archived") : undefined,
  );
  const order = filters?.sort === "name" ? asc(products.name) : filters?.sort === "status" ? asc(products.status) : desc(products.updatedAt);
  const [totalRow] = await db
    .select({ total: count() })
    .from(products)
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(where);
  const total = Number(totalRow?.total ?? 0);
  const page = resolveAdminProductPage(filters?.page, total);
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      status: products.status,
      productType: products.productType,
      brandName: brands.name,
      categoryName: categories.name,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(where)
    .orderBy(order)
    .limit(ADMIN_PRODUCT_PAGE_SIZE)
    .offset((page - 1) * ADMIN_PRODUCT_PAGE_SIZE);
  return {
    rows: rows.map((row) => ({
    ...row,
    brandName: row.brandName ?? "Unknown brand",
    categoryName: row.categoryName ?? "Uncategorized",
    })),
    total,
    page,
    pageSize: ADMIN_PRODUCT_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_PRODUCT_PAGE_SIZE)),
  };
}

export async function bulkUpdateProducts(role: StaffRole, productIds: string[], status: "draft" | "active" | "archived") {
  assertProductsWrite(role);
  const ids = [...new Set(productIds.filter((id) => /^[0-9a-f-]{36}$/i.test(id)))];
  if (!ids.length) throw new CatalogueAdminError("Select at least one product.");
  await getDb().update(products).set({ status, updatedAt: new Date() }).where(and(inArray(products.id, ids), isNull(products.deletedAt)));
  return ids.length;
}

export async function bulkSetCategoriesActive(role: StaffRole, categoryIds: string[], active: boolean) {
  assertTaxonomyWrite(role, "categories");
  const ids = [...new Set(categoryIds.filter((id) => /^[0-9a-f-]{36}$/i.test(id)))];
  if (!ids.length) throw new CatalogueAdminError("Select at least one category.");
  await getDb().update(categories).set({ active, updatedAt: new Date() }).where(inArray(categories.id, ids));
  return ids.length;
}

export async function bulkSetBrandsActive(role: StaffRole, brandIds: string[], active: boolean) {
  assertTaxonomyWrite(role, "brands");
  const ids = [...new Set(brandIds.filter((id) => /^[0-9a-f-]{36}$/i.test(id)))];
  if (!ids.length) throw new CatalogueAdminError("Select at least one brand.");
  await getDb().update(brands).set({ active, updatedAt: new Date() }).where(inArray(brands.id, ids));
  return ids.length;
}

export async function listTaxonomyOptions(include?: { brandId?: string; categoryId?: string }) {
  const db = getDb();
  const [brandRows, categoryRows] = await Promise.all([
    db
      .select({ id: brands.id, name: brands.name, slug: brands.slug, active: brands.active })
      .from(brands)
      .where(and(or(eq(brands.active, true), include?.brandId ? eq(brands.id, include.brandId) : undefined), isNull(brands.deletedAt)))
      .orderBy(asc(brands.name)),
    db
      .select({ id: categories.id, name: categories.name, parentId: categories.parentId, slug: categories.slug, description: categories.description, imagePublicId: categories.imagePublicId, position: categories.position, active: categories.active })
      .from(categories)
      .where(and(or(eq(categories.active, true), include?.categoryId ? eq(categories.id, include.categoryId) : undefined), isNull(categories.deletedAt)))
      .orderBy(asc(categories.position), asc(categories.name)),
  ]);
  return { brands: brandRows, categories: categoryRows };
}

export async function getAdminProduct(productId: string) {
  const db = getDb();
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, productId), isNull(products.deletedAt)))
    .limit(1);
  if (!product) {
    return null;
  }

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, product.id))
    .orderBy(asc(productVariants.sku));

  const variantIds = variants.map((variant) => variant.id);

  const [tiers, images, aliases, attributes, bundleRows] = await Promise.all([
    variantIds.length
      ? db
          .select()
          .from(priceTiers)
          .where(inArray(priceTiers.variantId, variantIds))
          .orderBy(asc(priceTiers.minimumQuantity))
      : Promise.resolve([]),
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.position)),
    db
      .select()
      .from(productAliases)
      .where(eq(productAliases.productId, product.id)),
    db
      .select()
      .from(productAttributes)
      .where(eq(productAttributes.productId, product.id))
      .orderBy(asc(productAttributes.position)),
    db
      .select({
        id: productBundleItems.id,
        quantity: productBundleItems.quantity,
        sku: productVariants.sku,
        variantId: productBundleItems.variantId,
      })
      .from(productBundleItems)
      .innerJoin(productVariants, eq(productVariants.id, productBundleItems.variantId))
      .where(eq(productBundleItems.bundleProductId, product.id)),
  ]);

  return {
    ...product,
    variants,
    tiers,
    images,
    aliases,
    attributes,
    bundleItems: bundleRows,
  };
}

export async function listAdminCategories() {
  const db = getDb();
  return db
    .select()
    .from(categories)
    .where(isNull(categories.deletedAt))
    .orderBy(asc(categories.position), asc(categories.name));
}

export async function listAdminBrands() {
  const db = getDb();
  return db
    .select()
    .from(brands)
    .where(isNull(brands.deletedAt))
    .orderBy(asc(brands.name));
}

export async function listAdminPricingRows() {
  const db = getDb();
  const rows = await db
    .select({
      variantId: productVariants.id,
      sku: productVariants.sku,
      unitLabel: productVariants.unitLabel,
      baseUnitPrice: productVariants.baseUnitPrice,
      productId: products.id,
      productName: products.name,
      status: products.status,
      variantActive: productVariants.active,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(isNull(products.deletedAt))
    .orderBy(asc(products.name), asc(productVariants.sku));

  const variantIds = rows.map((row) => row.variantId);
  const tiers = variantIds.length
    ? await db
        .select()
        .from(priceTiers)
        .where(inArray(priceTiers.variantId, variantIds))
        .orderBy(asc(priceTiers.minimumQuantity))
    : [];

  return rows.map((row) => ({
    ...row,
    tiers: tiers.filter((tier) => tier.variantId === row.variantId),
  }));
}

export async function createProduct(input: {
  role: StaffRole;
  name: string;
  slug?: string;
  brandId: string;
  categoryId: string;
  productType: "standard" | "bundle";
  description: string;
  status: "draft" | "active" | "archived";
  sku: string;
  unitLabel: string;
  baseUnitPricePesewas: number;
  openingStock?: string;
  lowStockThreshold?: string;
  images?: Array<{ cloudinaryPublicId: string; alt: string; position: number }>;
}) {
  assertProductsWrite(input.role);
  const name = input.name.trim();
  if (name.length < 2 || name.length > 200) throw new CatalogueAdminError("Product name must be between 2 and 200 characters.");
  if (input.baseUnitPricePesewas < 0 || !Number.isInteger(input.baseUnitPricePesewas)) {
    throw new CatalogueAdminError("Base price must be integer pesewas.");
  }

  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(name);
  const sku = input.sku.trim().toUpperCase();
  if (!sku || sku.length > 80) throw new CatalogueAdminError("SKU is required and must be 80 characters or fewer.");
  let openingInventory: { onHand: number; lowStockThreshold: number };
  try {
    openingInventory = parseOpeningInventory({ onHand: input.openingStock ?? "", lowStockThreshold: input.lowStockThreshold ?? "" });
  } catch (error) {
    throw new CatalogueAdminError(error instanceof Error ? error.message : "Opening inventory values are invalid.");
  }
  const images = (input.images ?? []).map((image, index) => ({
    cloudinaryPublicId: normalizeCloudinaryPublicId(image.cloudinaryPublicId),
    alt: image.alt.trim(),
    position: Number.isInteger(image.position) ? image.position : index,
  }));
  if (images.length > 4) throw new CatalogueAdminError("A product can have up to 4 images.");
  if (images.some((image) => !image.cloudinaryPublicId || !image.alt)) throw new CatalogueAdminError("Every product image needs alt text.");
  if (new Set(images.map((image) => image.cloudinaryPublicId)).size !== images.length) throw new CatalogueAdminError("Each product image must be unique.");

  const db = getDb();
  try {
    const created = await db.transaction(async (tx) => {
      const [product] = await tx
        .insert(products)
        .values({
          name,
          slug,
          brandId: input.brandId,
          categoryId: input.categoryId,
          productType: input.productType,
          description: input.description.trim() || null,
          status: input.status,
        })
        .returning();
      if (!product) {
        throw new CatalogueAdminError("Could not create the product.");
      }

      const [variant] = await tx
        .insert(productVariants)
        .values({
          productId: product.id,
          sku,
          unitLabel: input.unitLabel.trim() || "each",
          baseUnitPrice: input.baseUnitPricePesewas,
        })
        .returning();
      if (!variant) {
        throw new CatalogueAdminError("Could not create the first variant.");
      }

      await tx.insert(inventory).values({ variantId: variant.id, onHand: openingInventory.onHand, lowStockThreshold: openingInventory.lowStockThreshold });
      if (images.length) await tx.insert(productImages).values(images.map((image) => ({ productId: product.id, variantId: variant.id, ...image })));
      return product;
    });

    await refreshProductSearchDocument(created.id);
    return created;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("products_slug_unique")) {
      throw new CatalogueAdminError("That product slug is already in use.");
    }
    if (message.includes("product_variants_sku_unique")) {
      throw new CatalogueAdminError("That SKU is already in use.");
    }
    throw error instanceof CatalogueAdminError
      ? error
      : new CatalogueAdminError("Could not create that product.");
  }
}

export async function saveProduct(input: {
  role: StaffRole;
  productId: string;
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  productType: "standard" | "bundle";
  description: string;
  status: "draft" | "active" | "archived";
}) {
  assertProductsWrite(input.role);
  const name = input.name.trim();
  if (name.length < 2 || name.length > 200) throw new CatalogueAdminError("Product name must be between 2 and 200 characters.");
  const db = getDb();
  const [updated] = await db
    .update(products)
    .set({
      name,
      slug: slugify(input.slug || name),
      brandId: input.brandId,
      categoryId: input.categoryId,
      productType: input.productType,
      description: input.description.trim() || null,
      status: input.status,
      updatedAt: new Date(),
    })
    .where(eq(products.id, input.productId))
    .returning();
  if (!updated) {
    throw new CatalogueAdminError("That product was not found.");
  }
  await refreshProductSearchDocument(updated.id);
  return updated;
}

export async function addVariant(input: {
  role: StaffRole;
  productId: string;
  sku: string;
  unitLabel: string;
  baseUnitPricePesewas: number;
}) {
  assertProductsWrite(input.role);
  if (input.baseUnitPricePesewas < 0 || !Number.isInteger(input.baseUnitPricePesewas)) {
    throw new CatalogueAdminError("Base price must be integer pesewas.");
  }
  const db = getDb();
  try {
    const variant = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(productVariants)
        .values({
          productId: input.productId,
          sku: input.sku.trim().toUpperCase(),
          unitLabel: input.unitLabel.trim() || "each",
          baseUnitPrice: input.baseUnitPricePesewas,
        })
        .returning();
      if (!created) {
        throw new CatalogueAdminError("Could not add that variant.");
      }
      await tx.insert(inventory).values({ variantId: created.id, onHand: 0 });
      return created;
    });
    await refreshProductSearchDocument(input.productId);
    return variant;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("product_variants_sku_unique")) {
      throw new CatalogueAdminError("That SKU is already in use.");
    }
    throw error instanceof CatalogueAdminError
      ? error
      : new CatalogueAdminError("Could not add that variant.");
  }
}

export async function saveVariant(input: {
  role: StaffRole;
  variantId: string;
  sku: string;
  unitLabel: string;
  barcode: string;
  name: string;
  active: boolean;
  baseUnitPricePesewas?: number;
}) {
  assertProductsWrite(input.role);
  const db = getDb();
  const [existing] = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.id, input.variantId))
    .limit(1);
  if (!existing) {
    throw new CatalogueAdminError("That variant was not found.");
  }

  const priceUpdate =
    input.baseUnitPricePesewas === undefined
      ? {}
      : (() => {
          assertPricingWrite(input.role);
          if (
            !Number.isInteger(input.baseUnitPricePesewas) ||
            input.baseUnitPricePesewas < 0
          ) {
            throw new CatalogueAdminError("Base price must be integer pesewas.");
          }
          return { baseUnitPrice: input.baseUnitPricePesewas };
        })();

  await db
    .update(productVariants)
    .set({
      sku: input.sku.trim().toUpperCase(),
      unitLabel: input.unitLabel.trim() || "each",
      barcode: input.barcode.trim() || null,
      name: input.name.trim() || null,
      active: input.active,
      updatedAt: new Date(),
      ...priceUpdate,
    })
    .where(eq(productVariants.id, input.variantId));
  await refreshProductSearchDocument(existing.productId);
}

export async function addPriceTier(input: {
  role: StaffRole;
  variantId: string;
  minimumQuantity: number;
  maximumQuantity: number | null;
  unitPricePesewas: number | null;
  requestQuote: boolean;
}) {
  assertPricingWrite(input.role);
  if (!Number.isInteger(input.minimumQuantity) || input.minimumQuantity < 1) {
    throw new CatalogueAdminError("Minimum quantity must be a whole number of at least 1.");
  }
  if (
    input.maximumQuantity !== null &&
    (!Number.isInteger(input.maximumQuantity) ||
      input.maximumQuantity < input.minimumQuantity)
  ) {
    throw new CatalogueAdminError("Maximum quantity must be at or above the minimum.");
  }
  if (input.requestQuote) {
    if (input.unitPricePesewas !== null) {
      throw new CatalogueAdminError("A request-quote tier cannot also have a unit price.");
    }
  } else if (
    input.unitPricePesewas === null ||
    !Number.isInteger(input.unitPricePesewas) ||
    input.unitPricePesewas < 0
  ) {
    throw new CatalogueAdminError("Set a unit price in pesewas, or mark request quote.");
  }

  const db = getDb();
  const [tier] = await db
    .insert(priceTiers)
    .values({
      variantId: input.variantId,
      minimumQuantity: input.minimumQuantity,
      maximumQuantity: input.maximumQuantity,
      unitPrice: input.requestQuote ? null : input.unitPricePesewas,
      requestQuote: input.requestQuote,
    })
    .returning();
  if (!tier) {
    throw new CatalogueAdminError("Could not add that price band.");
  }
  return tier;
}

export async function deactivatePriceTier(input: { role: StaffRole; tierId: string }) {
  assertPricingWrite(input.role);
  const db = getDb();
  const [updated] = await db
    .update(priceTiers)
    .set({ active: false })
    .where(eq(priceTiers.id, input.tierId))
    .returning();
  if (!updated) {
    throw new CatalogueAdminError("That price band was not found.");
  }
}

export async function saveCategory(input: {
  role: StaffRole;
  categoryId?: string;
  name: string;
  slug?: string;
  parentId: string | null;
  description: string;
  imagePublicId?: string;
  position: number;
  active: boolean;
}) {
  assertTaxonomyWrite(input.role, "categories");
  if (!Number.isInteger(input.position)) {
    throw new CatalogueAdminError("Position must be a whole number.");
  }
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);
  const imagePublicId = input.imagePublicId ? normalizeCloudinaryPublicId(input.imagePublicId) || null : null;
  const db = getDb();
  if (input.parentId) {
    if (input.parentId === input.categoryId) {
      throw new CatalogueAdminError("A category cannot be its own parent.");
    }
    const [parent] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, input.parentId));
    if (!parent) throw new CatalogueAdminError("Choose an existing parent category.");
    if (input.categoryId) {
      const visited = new Set<string>();
      let ancestorId: string | null = input.parentId;
      while (ancestorId && !visited.has(ancestorId)) {
        if (ancestorId === input.categoryId) throw new CatalogueAdminError("A category cannot be moved beneath one of its descendants.");
        visited.add(ancestorId);
        const [ancestor] = await db.select({ parentId: categories.parentId }).from(categories).where(eq(categories.id, ancestorId));
        ancestorId = ancestor?.parentId ?? null;
      }
    }
  }
  if (input.categoryId) {
    const [updated] = await db
      .update(categories)
      .set({
        name: input.name.trim(),
        slug,
        parentId: input.parentId,
        description: input.description.trim() || null,
        imagePublicId,
        position: input.position,
        active: input.active,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, input.categoryId))
      .returning();
    if (!updated) {
      throw new CatalogueAdminError("That category was not found.");
    }
    return updated;
  }

  try {
    const [created] = await db
      .insert(categories)
      .values({
        name: input.name.trim(),
        slug,
        parentId: input.parentId,
        description: input.description.trim() || null,
        imagePublicId,
        position: input.position,
        active: input.active,
      })
      .returning();
    if (!created) {
      throw new CatalogueAdminError("Could not create the category.");
    }
    return created;
  } catch (error) {
    if (error instanceof Error && error.message.includes("categories_slug_unique")) {
      throw new CatalogueAdminError("That category slug is already in use.");
    }
    throw error instanceof CatalogueAdminError
      ? error
      : new CatalogueAdminError("Could not save that category.");
  }
}

export async function saveBrand(input: {
  role: StaffRole;
  brandId?: string;
  name: string;
  slug?: string;
  active: boolean;
}) {
  assertTaxonomyWrite(input.role, "brands");
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);
  const db = getDb();
  if (input.brandId) {
    const [updated] = await db
      .update(brands)
      .set({
        name: input.name.trim(),
        slug,
        active: input.active,
        updatedAt: new Date(),
      })
      .where(eq(brands.id, input.brandId))
      .returning();
    if (!updated) {
      throw new CatalogueAdminError("That brand was not found.");
    }
    return updated;
  }

  try {
    const [created] = await db
      .insert(brands)
      .values({ name: input.name.trim(), slug, active: input.active })
      .returning();
    if (!created) {
      throw new CatalogueAdminError("Could not create the brand.");
    }
    return created;
  } catch (error) {
    if (error instanceof Error && error.message.includes("brands_slug_unique")) {
      throw new CatalogueAdminError("That brand slug is already in use.");
    }
    throw error instanceof CatalogueAdminError
      ? error
      : new CatalogueAdminError("Could not save that brand.");
  }
}

export async function addProductImage(input: {
  role: StaffRole;
  productId: string;
  cloudinaryPublicId: string;
  alt: string;
  position: number;
}) {
  assertProductsWrite(input.role);
  const publicId = normalizeCloudinaryPublicId(input.cloudinaryPublicId);
  const alt = input.alt.trim();
  if (!publicId || !alt) {
    throw new CatalogueAdminError("Cloudinary public ID and alt text are required.");
  }
  const db = getDb();
  const [{ imageCount }] = await db
    .select({ imageCount: count(productImages.id) })
    .from(productImages)
    .where(eq(productImages.productId, input.productId));
  if (Number(imageCount) >= 4) {
    throw new CatalogueAdminError("A product can have up to 4 images.");
  }
  const [duplicate] = await db
    .select({ id: productImages.id })
    .from(productImages)
    .where(and(eq(productImages.productId, input.productId), eq(productImages.cloudinaryPublicId, publicId)))
    .limit(1);
  if (duplicate) throw new CatalogueAdminError("That image is already attached to this product.");
  const [image] = await db
    .insert(productImages)
    .values({
      productId: input.productId,
      cloudinaryPublicId: publicId,
      alt,
      position: Number.isInteger(input.position) ? input.position : 0,
    })
    .returning();
  if (!image) {
    throw new CatalogueAdminError("Could not add that image.");
  }
  return image;
}

export async function addProductImages(input: {
  role: StaffRole;
  productId: string;
  images: Array<{ cloudinaryPublicId: string; alt: string; position: number }>;
}) {
  assertProductsWrite(input.role);
  if (!input.images.length) throw new CatalogueAdminError("Upload at least one image first.");
  if (input.images.length > 4) throw new CatalogueAdminError("A product can have up to 4 images.");
  const images = input.images.map((image, index) => {
    const publicId = normalizeCloudinaryPublicId(image.cloudinaryPublicId);
    const alt = image.alt.trim();
    if (!publicId || !alt) throw new CatalogueAdminError("Cloudinary public ID and alt text are required for every image.");
    return { cloudinaryPublicId: publicId, alt, position: Number.isInteger(image.position) ? image.position : index };
  });
  if (new Set(images.map((image) => image.cloudinaryPublicId)).size !== images.length) {
    throw new CatalogueAdminError("Each image must be unique.");
  }
  const db = getDb();
  await db.transaction(async (tx) => {
    const existing = await tx.select({ cloudinaryPublicId: productImages.cloudinaryPublicId }).from(productImages).where(eq(productImages.productId, input.productId));
    if (existing.length + images.length > 4) throw new CatalogueAdminError("A product can have up to 4 images.");
    if (images.some((image) => existing.some((item) => item.cloudinaryPublicId === image.cloudinaryPublicId))) {
      throw new CatalogueAdminError("One or more images are already attached to this product.");
    }
    await tx.insert(productImages).values(images.map((image) => ({ productId: input.productId, ...image })));
  });
  return images.length;
}

/** Update only a category image without requiring the rest of the edit form. */
export async function updateCategoryImage(input: { role: StaffRole; categoryId: string; imagePublicId: string | null }) {
  assertTaxonomyWrite(input.role, "categories");
  const imagePublicId = input.imagePublicId ? normalizeCloudinaryPublicId(input.imagePublicId) || null : null;
  const [updated] = await getDb()
    .update(categories)
    .set({ imagePublicId, updatedAt: new Date() })
    .where(eq(categories.id, input.categoryId))
    .returning({ id: categories.id, imagePublicId: categories.imagePublicId });
  if (!updated) throw new CatalogueAdminError("That category was not found.");
  return updated;
}

export async function savePriceTier(input: {
  role: StaffRole;
  tierId: string;
  minimumQuantity: number;
  maximumQuantity: number | null;
  unitPricePesewas: number | null;
  requestQuote: boolean;
}) {
  assertPricingWrite(input.role);
  if (!Number.isInteger(input.minimumQuantity) || input.minimumQuantity < 1) throw new CatalogueAdminError("Minimum quantity must be a whole number of at least 1.");
  if (input.maximumQuantity !== null && (!Number.isInteger(input.maximumQuantity) || input.maximumQuantity < input.minimumQuantity)) throw new CatalogueAdminError("Maximum quantity must be at or above the minimum.");
  if (input.requestQuote && input.unitPricePesewas !== null) throw new CatalogueAdminError("A request-quote tier cannot also have a unit price.");
  if (!input.requestQuote && (input.unitPricePesewas === null || !Number.isInteger(input.unitPricePesewas) || input.unitPricePesewas < 0)) throw new CatalogueAdminError("Set a unit price in pesewas, or mark request quote.");
  const [updated] = await getDb().update(priceTiers).set({ minimumQuantity: input.minimumQuantity, maximumQuantity: input.maximumQuantity, unitPrice: input.requestQuote ? null : input.unitPricePesewas, requestQuote: input.requestQuote }).where(eq(priceTiers.id, input.tierId)).returning();
  if (!updated) throw new CatalogueAdminError("That price band was not found.");
  return updated;
}

/** Accept the Cloudinary URL shown in the dashboard as well as a raw public ID. */
function normalizeCloudinaryPublicId(value: string) {
  const raw = value.trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    if (!parsed.hostname.endsWith("cloudinary.com")) return raw;
    const marker = "/image/upload/";
    const index = parsed.pathname.indexOf(marker);
    if (index === -1) return raw;
    const segments = parsed.pathname.slice(index + marker.length).split("/").filter(Boolean);
    while (segments.length && /^(?:f_|q_|w_|h_|c_|g_|e_|fl_|dpr_|ar_)/.test(segments[0])) segments.shift();
    return segments.join("/").replace(/\.[a-z0-9]{2,5}$/i, "");
  } catch {
    return raw;
  }
}

export async function removeProductImage(input: { role: StaffRole; imageId: string }) {
  assertProductsWrite(input.role);
  const db = getDb();
  const [current] = await db.select({ cloudinaryPublicId: productImages.cloudinaryPublicId }).from(productImages).where(eq(productImages.id, input.imageId)).limit(1);
  await db.delete(productImages).where(eq(productImages.id, input.imageId));
  if (current) {
    const [{ references }] = await db.select({ references: count(productImages.id) }).from(productImages).where(eq(productImages.cloudinaryPublicId, current.cloudinaryPublicId));
    if (Number(references) === 0) {
      try { await destroyCloudinaryImage(current.cloudinaryPublicId); } catch (error) { console.error("[cloudinary] deleted product image cleanup failed", error instanceof Error ? error.name : "unknown"); }
    }
  }
}

export async function updateProductImage(input: { role: StaffRole; imageId: string; alt: string }) {
  assertProductsWrite(input.role);
  const alt = input.alt.trim();
  if (!alt) throw new CatalogueAdminError("Alt text is required.");
  const [updated] = await getDb().update(productImages).set({ alt }).where(eq(productImages.id, input.imageId)).returning();
  if (!updated) throw new CatalogueAdminError("That product image was not found.");
  return updated;
}

export async function replaceProductImage(input: { role: StaffRole; productId: string; imageId: string; cloudinaryPublicId: string }) {
  assertProductsWrite(input.role);
  const publicId = normalizeCloudinaryPublicId(input.cloudinaryPublicId);
  if (!publicId) throw new CatalogueAdminError("A valid Cloudinary image is required.");
  const db = getDb();
  const [current] = await db.select({ cloudinaryPublicId: productImages.cloudinaryPublicId }).from(productImages).where(and(eq(productImages.id, input.imageId), eq(productImages.productId, input.productId))).limit(1);
  if (!current) throw new CatalogueAdminError("That product image was not found.");
  const [updated] = await db
    .update(productImages)
    .set({ cloudinaryPublicId: publicId })
    .where(eq(productImages.id, input.imageId))
    .returning();
  if (updated && current.cloudinaryPublicId !== publicId) {
    const [{ references }] = await db.select({ references: count(productImages.id) }).from(productImages).where(eq(productImages.cloudinaryPublicId, current.cloudinaryPublicId));
    if (Number(references) === 0) {
      try { await destroyCloudinaryImage(current.cloudinaryPublicId); } catch (error) { console.error("[cloudinary] old product image cleanup failed", error instanceof Error ? error.name : "unknown"); }
    }
  }
  return updated;
}

/** Move a product image one slot while preserving the saved ordering. */
export async function moveProductImage(input: { role: StaffRole; imageId: string; direction: "up" | "down" }) {
  assertProductsWrite(input.role);
  const db = getDb();
  const [current] = await db
    .select({ id: productImages.id, productId: productImages.productId, position: productImages.position })
    .from(productImages)
    .where(eq(productImages.id, input.imageId))
    .limit(1);
  if (!current) throw new CatalogueAdminError("That product image was not found.");

  const images = await db
    .select({ id: productImages.id, position: productImages.position })
    .from(productImages)
    .where(eq(productImages.productId, current.productId))
    .orderBy(asc(productImages.position), asc(productImages.id));
  const index = images.findIndex((image) => image.id === current.id);
  const targetIndex = input.direction === "up" ? index - 1 : index + 1;
  const target = images[targetIndex];
  if (!target) return current;

  await db.transaction(async (tx) => {
    await tx.update(productImages).set({ position: target.position }).where(eq(productImages.id, current.id));
    await tx.update(productImages).set({ position: current.position }).where(eq(productImages.id, target.id));
  });
  return { ...current, position: target.position };
}

export async function addProductAlias(input: {
  role: StaffRole;
  productId: string;
  alias: string;
}) {
  return addProductAliases(input);
}

export async function addProductAliases(input: {
  role: StaffRole;
  productId: string;
  alias: string;
}) {
  assertProductsWrite(input.role);
  const aliases = [...new Map(input.alias.split(/[\n,]+/).map((value) => value.trim()).filter(Boolean).map((value) => [value.toLocaleLowerCase(), value])).values()];
  if (!aliases.length) throw new CatalogueAdminError("Enter at least one search alias.");
  if (aliases.length > 50) throw new CatalogueAdminError("Add up to 50 aliases at a time.");
  if (aliases.some((alias) => alias.length > 120)) throw new CatalogueAdminError("Each alias must be 120 characters or fewer.");
  const db = getDb();
  await db.insert(productAliases).values(aliases.map((alias) => ({ productId: input.productId, alias })));
  await refreshProductSearchDocument(input.productId);
  return aliases.length;
}

export async function removeProductAlias(input: { role: StaffRole; aliasId: string }) {
  assertProductsWrite(input.role);
  const db = getDb();
  const [removed] = await db
    .delete(productAliases)
    .where(eq(productAliases.id, input.aliasId))
    .returning();
  if (removed) {
    await refreshProductSearchDocument(removed.productId);
  }
}

export async function addProductAttribute(input: {
  role: StaffRole;
  productId: string;
  namespace: string;
  key: string;
  valueText: string;
}) {
  assertProductsWrite(input.role);
  const namespace = input.namespace.trim();
  const key = input.key.trim();
  const valueText = input.valueText.trim();
  if (!namespace || !key || !valueText) {
    throw new CatalogueAdminError("Attribute namespace, key, and value are required.");
  }
  const db = getDb();
  await db.insert(productAttributes).values({
    productId: input.productId,
    namespace,
    key,
    valueText,
  });
}

export async function removeProductAttribute(input: {
  role: StaffRole;
  attributeId: string;
}) {
  assertProductsWrite(input.role);
  const db = getDb();
  await db.delete(productAttributes).where(eq(productAttributes.id, input.attributeId));
}

export async function addBundleItem(input: {
  role: StaffRole;
  bundleProductId: string;
  sku: string;
  quantity: number;
}) {
  assertProductsWrite(input.role);
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    throw new CatalogueAdminError("Bundle quantity must be a whole number of at least 1.");
  }
  const db = getDb();
  const [bundle] = await db
    .select({ id: products.id, productType: products.productType })
    .from(products)
    .where(eq(products.id, input.bundleProductId))
    .limit(1);
  if (!bundle || bundle.productType !== "bundle") {
    throw new CatalogueAdminError("Bundle items can only be added to office packs.");
  }
  const [variant] = await db
    .select({ id: productVariants.id, productId: productVariants.productId })
    .from(productVariants)
    .where(eq(productVariants.sku, input.sku.trim().toUpperCase()))
    .limit(1);
  if (!variant) {
    throw new CatalogueAdminError("No variant matches that SKU.");
  }
  if (variant.productId === input.bundleProductId) {
    throw new CatalogueAdminError("A pack cannot include itself.");
  }
  await db.insert(productBundleItems).values({
    bundleProductId: input.bundleProductId,
    variantId: variant.id,
    quantity: input.quantity,
  });
}

export async function removeBundleItem(input: { role: StaffRole; bundleItemId: string }) {
  assertProductsWrite(input.role);
  const db = getDb();
  await db.delete(productBundleItems).where(eq(productBundleItems.id, input.bundleItemId));
}

export function parseOptionalPesewas(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return null;
  }
  return parseGhsToPesewas(raw);
}

export function parseRequiredPesewas(value: FormDataEntryValue | null) {
  const parsed = parseOptionalPesewas(value);
  if (parsed === null) {
    throw new CatalogueAdminError("Enter a GHS amount such as 78.99");
  }
  return parsed;
}
