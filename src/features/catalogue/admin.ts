import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
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

export async function listAdminProducts() {
  const db = getDb();
  return db
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
    .innerJoin(brands, eq(brands.id, products.brandId))
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(isNull(products.deletedAt))
    .orderBy(desc(products.updatedAt));
}

export async function listTaxonomyOptions() {
  const db = getDb();
  const [brandRows, categoryRows] = await Promise.all([
    db
      .select({ id: brands.id, name: brands.name })
      .from(brands)
      .where(and(eq(brands.active, true), isNull(brands.deletedAt)))
      .orderBy(asc(brands.name)),
    db
      .select({ id: categories.id, name: categories.name, parentId: categories.parentId })
      .from(categories)
      .where(and(eq(categories.active, true), isNull(categories.deletedAt)))
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
}) {
  assertProductsWrite(input.role);
  if (input.baseUnitPricePesewas < 0 || !Number.isInteger(input.baseUnitPricePesewas)) {
    throw new CatalogueAdminError("Base price must be integer pesewas.");
  }

  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);
  const sku = input.sku.trim().toUpperCase();
  if (!sku) {
    throw new CatalogueAdminError("SKU is required.");
  }

  const db = getDb();
  try {
    const created = await db.transaction(async (tx) => {
      const [product] = await tx
        .insert(products)
        .values({
          name: input.name.trim(),
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

      await tx.insert(inventory).values({ variantId: variant.id, onHand: 0 });
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
  const db = getDb();
  const [updated] = await db
    .update(products)
    .set({
      name: input.name.trim(),
      slug: slugify(input.slug || input.name),
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
  position: number;
  active: boolean;
}) {
  assertTaxonomyWrite(input.role, "categories");
  if (!Number.isInteger(input.position)) {
    throw new CatalogueAdminError("Position must be a whole number.");
  }
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);
  const db = getDb();
  if (input.categoryId) {
    const [updated] = await db
      .update(categories)
      .set({
        name: input.name.trim(),
        slug,
        parentId: input.parentId,
        description: input.description.trim() || null,
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
  const publicId = input.cloudinaryPublicId.trim();
  const alt = input.alt.trim();
  if (!publicId || !alt) {
    throw new CatalogueAdminError("Cloudinary public ID and alt text are required.");
  }
  const db = getDb();
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

export async function removeProductImage(input: { role: StaffRole; imageId: string }) {
  assertProductsWrite(input.role);
  const db = getDb();
  await db.delete(productImages).where(eq(productImages.id, input.imageId));
}

export async function addProductAlias(input: {
  role: StaffRole;
  productId: string;
  alias: string;
}) {
  assertProductsWrite(input.role);
  const alias = input.alias.trim();
  if (!alias) {
    throw new CatalogueAdminError("Enter a search alias.");
  }
  const db = getDb();
  await db.insert(productAliases).values({ productId: input.productId, alias });
  await refreshProductSearchDocument(input.productId);
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
