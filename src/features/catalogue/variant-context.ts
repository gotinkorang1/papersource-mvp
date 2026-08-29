import { and, eq } from "drizzle-orm";
import { resolveUnitPrice } from "@/features/catalogue/pricing";
import { buildSpecLine } from "@/features/catalogue/search";
import { getDb } from "@/lib/db/client";
import {
  priceTiers,
  productAttributes,
  products,
  productVariants,
} from "@/lib/db/schema";

export async function loadSellableVariant(variantId: string) {
  const db = getDb();
  const [row] = await db
    .select({
      variant: productVariants,
      product: products,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(eq(productVariants.id, variantId))
    .limit(1);

  if (!row || !row.variant.active || row.product.status !== "active") {
    return null;
  }

  const [tiers, attributes] = await Promise.all([
    db
      .select()
      .from(priceTiers)
      .where(
        and(eq(priceTiers.variantId, variantId), eq(priceTiers.active, true)),
      ),
    db
      .select()
      .from(productAttributes)
      .where(eq(productAttributes.productId, row.product.id)),
  ]);

  return {
    ...row,
    tiers: tiers.map((tier) => ({
      minimumQuantity: tier.minimumQuantity,
      maximumQuantity: tier.maximumQuantity,
      unitPricePesewas: tier.unitPrice,
      requestQuote: tier.requestQuote,
    })),
    specLine:
      buildSpecLine(
        attributes
          .sort((a, b) => a.position - b.position)
          .map((attribute) => ({
            namespace: attribute.namespace,
            key: attribute.key,
            valueText: attribute.valueText,
          })),
      ) || row.product.name,
  };
}

export function previewUnitPrice(
  quantity: number,
  baseUnitPrice: number,
  tiers: {
    minimumQuantity: number;
    maximumQuantity: number | null;
    unitPricePesewas: number | null;
    requestQuote: boolean;
  }[],
) {
  const resolved = resolveUnitPrice({
    quantity,
    baseUnitPricePesewas: baseUnitPrice,
    tiers,
  });
  return resolved.unitPricePesewas;
}
