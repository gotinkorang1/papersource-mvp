import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";
import { closeDb, getDb } from "../src/lib/db/client";
import { seedUuid } from "../src/lib/db/seed-ids";
import {
  brands,
  categories,
  deliveryZones,
  inventory,
  priceTiers,
  productAliases,
  productAttributes,
  products,
  productVariants,
} from "../src/lib/db/schema";
import {
  seedBrands,
  seedCategories,
  seedDeliveryZones,
  seedProducts,
} from "../src/features/catalogue/local-data";

config({ path: ".env.local" });

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is missing. Point .env.local at the papersource-postgres container.",
    );
  }

  const db = getDb();

  const parentCategories = seedCategories.filter((category) => !category.parentId);
  const childCategories = seedCategories.filter((category) => category.parentId);

  for (const group of [parentCategories, childCategories]) {
    for (const category of group) {
      await db
        .insert(categories)
        .values({
          id: seedUuid("category", category.slug),
          parentId: category.parentId
            ? seedUuid("category", category.parentId)
            : null,
          name: category.name,
          slug: category.slug,
          description: category.caption,
          position: category.position,
          active: true,
        })
        .onConflictDoUpdate({
          target: categories.slug,
          set: {
            name: category.name,
            description: category.caption,
            position: category.position,
            parentId: category.parentId
              ? seedUuid("category", category.parentId)
              : null,
            updatedAt: new Date(),
          },
        });
    }
  }

  for (const brand of seedBrands) {
    await db
      .insert(brands)
      .values({
        id: seedUuid("brand", brand.slug),
        name: brand.name,
        slug: brand.slug,
        active: true,
      })
      .onConflictDoUpdate({
        target: brands.slug,
        set: { name: brand.name, updatedAt: new Date() },
      });
  }

  for (const zone of seedDeliveryZones) {
    await db
      .insert(deliveryZones)
      .values({
        id: seedUuid("zone", zone.code),
        name: zone.name,
        region: zone.region,
        code: zone.code,
        basePrice: zone.basePrice,
        feeMode: zone.feeMode,
        estimatedMinDays: zone.estimatedMinDays,
        estimatedMaxDays: zone.estimatedMaxDays,
        active: true,
        sortOrder: zone.sortOrder,
      })
      .onConflictDoUpdate({
        target: deliveryZones.code,
        set: {
          name: zone.name,
          region: zone.region,
          basePrice: zone.basePrice,
          feeMode: zone.feeMode,
          estimatedMinDays: zone.estimatedMinDays,
          estimatedMaxDays: zone.estimatedMaxDays,
          sortOrder: zone.sortOrder,
        },
      });
  }

  for (const product of seedProducts) {
    const productId = seedUuid("product", product.slug);
    const variantId = seedUuid("variant", product.sku);

    await db
      .insert(products)
      .values({
        id: productId,
        name: product.name,
        slug: product.slug,
        brandId: seedUuid("brand", product.brandId),
        categoryId: seedUuid("category", product.categoryId),
        productType: product.productType,
        description: product.description,
        status: "active",
      })
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          name: product.name,
          description: product.description,
          productType: product.productType,
          status: "active",
          updatedAt: new Date(),
        },
      });

    await db
      .insert(productVariants)
      .values({
        id: variantId,
        productId,
        sku: product.sku,
        barcode: product.barcode,
        name: product.name,
        unitLabel: product.unitLabel,
        baseUnitPrice: product.baseUnitPricePesewas,
        currency: "GHS",
        active: true,
      })
      .onConflictDoUpdate({
        target: productVariants.sku,
        set: {
          name: product.name,
          barcode: product.barcode,
          unitLabel: product.unitLabel,
          baseUnitPrice: product.baseUnitPricePesewas,
          active: true,
          updatedAt: new Date(),
        },
      });

    await db
      .insert(inventory)
      .values({
        id: seedUuid("inventory", product.sku),
        variantId,
        onHand: product.onHand,
        reserved: product.reserved,
        lowStockThreshold: product.lowStockThreshold,
      })
      .onConflictDoUpdate({
        target: inventory.variantId,
        set: {
          onHand: product.onHand,
          reserved: product.reserved,
          lowStockThreshold: product.lowStockThreshold,
        },
      });

    await db.delete(priceTiers).where(eq(priceTiers.variantId, variantId));
    if (product.tiers.length) {
      await db.insert(priceTiers).values(
        product.tiers.map((tier) => ({
          id: seedUuid("tier", `${product.sku}:${tier.minimumQuantity}`),
          variantId,
          minimumQuantity: tier.minimumQuantity,
          maximumQuantity: tier.maximumQuantity,
          unitPrice: tier.unitPricePesewas,
          requestQuote: tier.requestQuote,
          currency: "GHS",
          active: true,
        })),
      );
    }

    await db.delete(productAttributes).where(eq(productAttributes.productId, productId));
    const attributeRows = [
      ...product.attributes.map((attribute, index) => ({
        id: seedUuid("attr", `${product.slug}:${attribute.namespace}:${attribute.key}:${index}`),
        productId,
        namespace: attribute.namespace,
        key: attribute.key,
        valueText: attribute.valueText,
        position: index,
      })),
      ...(product.bundleContents ?? []).map((item, index) => ({
        id: seedUuid("attr", `${product.slug}:bundle:item:${index}`),
        productId,
        namespace: "bundle",
        key: "item",
        valueText: item,
        position: 100 + index,
      })),
    ];
    if (attributeRows.length) {
      await db.insert(productAttributes).values(attributeRows);
    }

    await db.delete(productAliases).where(eq(productAliases.productId, productId));
    if (product.aliases.length) {
      await db.insert(productAliases).values(
        product.aliases.map((alias) => ({
          id: seedUuid("alias", `${product.slug}:${alias}`),
          productId,
          variantId,
          alias,
        })),
      );
    }
  }

  await db.execute(sql`
    update products p
    set search_document = to_tsvector(
      'simple',
      coalesce(p.name, '') || ' ' || coalesce(p.description, '') || ' ' || coalesce((
        select string_agg(a.alias, ' ')
        from product_aliases a
        where a.product_id = p.id
      ), '')
    )
  `);

  console.log(`Seeded ${seedProducts.length} PaperSource products into the dedicated database.`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
