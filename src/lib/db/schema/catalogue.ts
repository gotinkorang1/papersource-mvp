import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  customType,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { productStatusEnum, productTypeEnum } from "./enums";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id"),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    position: integer("position").notNull().default(0),
    imagePublicId: text("image_public_id"),
    active: boolean("active").notNull().default(true),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("categories_slug_unique").on(table.slug),
    index("categories_parent_idx").on(table.parentId),
  ],
);

export const brands = pgTable(
  "brands",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logoPublicId: text("logo_public_id"),
    active: boolean("active").notNull().default(true),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [uniqueIndex("brands_slug_unique").on(table.slug)],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    productType: productTypeEnum("product_type").notNull().default("standard"),
    description: text("description"),
    status: productStatusEnum("status").notNull().default("draft"),
    searchDocument: tsvector("search_document"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("products_slug_unique").on(table.slug),
    index("products_brand_idx").on(table.brandId),
    index("products_category_idx").on(table.categoryId),
    index("products_status_idx").on(table.status),
    index("products_search_gin").using("gin", table.searchDocument),
  ],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    sku: text("sku").notNull(),
    barcode: text("barcode"),
    name: text("name"),
    unitLabel: text("unit_label").notNull(),
    baseUnitPrice: integer("base_unit_price").notNull(),
    currency: char("currency", { length: 3 }).notNull().default("GHS"),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("product_variants_sku_unique").on(table.sku),
    index("product_variants_product_idx").on(table.productId),
    index("product_variants_sku_trgm").using(
      "gin",
      sql`${table.sku} gin_trgm_ops`,
    ),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    variantId: uuid("variant_id").references(() => productVariants.id),
    cloudinaryPublicId: text("cloudinary_public_id").notNull(),
    alt: text("alt").notNull(),
    position: integer("position").notNull().default(0),
  },
  (table) => [index("product_images_product_idx").on(table.productId)],
);

export const productAttributes = pgTable(
  "product_attributes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    variantId: uuid("variant_id").references(() => productVariants.id),
    namespace: text("namespace").notNull(),
    key: text("key").notNull(),
    valueText: text("value_text").notNull(),
    valueNum: integer("value_num"),
    position: integer("position").notNull().default(0),
  },
  (table) => [index("product_attributes_product_idx").on(table.productId)],
);

export const productAliases = pgTable(
  "product_aliases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    variantId: uuid("variant_id").references(() => productVariants.id),
    alias: text("alias").notNull(),
  },
  (table) => [
    index("product_aliases_product_idx").on(table.productId),
    index("product_aliases_trgm").using(
      "gin",
      sql`${table.alias} gin_trgm_ops`,
    ),
  ],
);

export const priceTiers = pgTable(
  "price_tiers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id),
    minimumQuantity: integer("minimum_quantity").notNull(),
    maximumQuantity: integer("maximum_quantity"),
    unitPrice: integer("unit_price"),
    requestQuote: boolean("request_quote").notNull().default(false),
    currency: char("currency", { length: 3 }).notNull().default("GHS"),
    active: boolean("active").notNull().default(true),
  },
  (table) => [index("price_tiers_variant_idx").on(table.variantId)],
);

export const productBundleItems = pgTable(
  "product_bundle_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bundleProductId: uuid("bundle_product_id")
      .notNull()
      .references(() => products.id),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id),
    quantity: integer("quantity").notNull(),
  },
  (table) => [index("product_bundle_items_bundle_idx").on(table.bundleProductId)],
);
