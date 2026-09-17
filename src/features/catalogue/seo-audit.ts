import { and, count, eq, exists, isNull, not, or } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { productAliases, productImages, products } from "@/lib/db/schema";

export type CatalogueSeoAudit = {
  activeProducts: number;
  missingDescriptions: number;
  missingImages: number;
  missingAliases: number;
};

const activeProductWhere = and(eq(products.status, "active"), isNull(products.deletedAt));

async function countProducts(where: ReturnType<typeof and>) {
  const [row] = await getDb().select({ total: count() }).from(products).where(and(activeProductWhere, where));
  return Number(row?.total ?? 0);
}

export async function getCatalogueSeoAudit(): Promise<CatalogueSeoAudit> {
  const [activeProducts, missingDescriptions, missingImages, missingAliases] = await Promise.all([
    countProducts(undefined),
    countProducts(or(isNull(products.description), eq(products.description, ""))),
    countProducts(not(exists(getDb().select({ id: productImages.id }).from(productImages).where(eq(productImages.productId, products.id))))),
    countProducts(not(exists(getDb().select({ id: productAliases.id }).from(productAliases).where(eq(productAliases.productId, products.id))))),
  ]);
  return { activeProducts, missingDescriptions, missingImages, missingAliases };
}
