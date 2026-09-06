import "server-only";
import { and, eq } from "drizzle-orm";
import { loadSellableVariant } from "@/features/catalogue/variant-context";
import { resolveUnitPrice } from "@/features/catalogue/pricing";
import { getDb } from "@/lib/db/client";
import { quoteItems, quotes } from "@/lib/db/schema";
import { commerceOwner, commerceInsertOwner, lockCommerce, type CommerceInput, type CommerceTransaction } from "@/lib/customer/commerce-identity";
import type { QuoteLinePreview } from "@/types/catalogue";

export async function getDraftQuote(identity: CommerceInput, db: CommerceTransaction | ReturnType<typeof getDb> = getDb()) {
  const [draft] = await db.select().from(quotes)
    .where(and(commerceOwner(quotes, identity), eq(quotes.status, "draft"))).limit(1);
  return draft ?? null;
}

export async function listQuoteLines(identity: CommerceInput, db: CommerceTransaction | ReturnType<typeof getDb> = getDb()): Promise<QuoteLinePreview[]> {
  const draft = await getDraftQuote(identity, db);
  if (!draft) return [];
  const items = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, draft.id));
  const lines: QuoteLinePreview[] = [];
  for (const item of items) {
    const context = item.variantId ? await loadSellableVariant(item.variantId) : null;
    lines.push({ id: item.variantId ?? item.id, name: item.nameSnapshot, sku: item.skuSnapshot,
      specLine: item.specSnapshot ?? item.nameSnapshot, quantity: item.quantity,
      unitPricePesewas: item.unitPrice, unitLabel: context?.variant.unitLabel ?? "each" });
  }
  return lines;
}

async function writeQuoteLine(identity: CommerceInput, variantId: string, quantity: number, mode: "add" | "set" | "remove") {
  if (mode !== "remove" && (!Number.isInteger(quantity) || quantity < 1 || quantity > 9_999)) throw new Error("Use a quantity between 1 and 9,999.");
  const context = mode === "remove" ? null : await loadSellableVariant(variantId);
  if (mode !== "remove" && !context) throw new Error("That product is not available for quotation.");
  await getDb().transaction(async (tx) => {
    await lockCommerce(tx, identity);
    let [draft] = await tx.select().from(quotes).where(and(commerceOwner(quotes, identity), eq(quotes.status, "draft"))).limit(1);
    if (!draft && mode === "add") [draft] = await tx.insert(quotes).values({ status: "draft", ...commerceInsertOwner(identity) }).returning();
    if (!draft) return;
    const predicate = and(eq(quoteItems.quoteId, draft.id), eq(quoteItems.variantId, variantId));
    if (mode === "remove") {
      await tx.delete(quoteItems).where(predicate);
    } else if (context) {
      const [current] = await tx.select().from(quoteItems).where(predicate).limit(1);
      const nextQuantity = mode === "add" ? (current?.quantity ?? 0) + quantity : quantity;
      if (nextQuantity > 9_999) throw new Error("Use a quantity between 1 and 9,999.");
      const price = resolveUnitPrice({ quantity: nextQuantity, baseUnitPricePesewas: context.variant.baseUnitPrice, tiers: context.tiers });
      const values = { quantity: nextQuantity, unitPrice: price.unitPricePesewas,
        lineTotal: price.unitPricePesewas === null ? null : price.unitPricePesewas * nextQuantity,
        nameSnapshot: context.product.name, skuSnapshot: context.variant.sku, specSnapshot: context.specLine };
      if (current) await tx.update(quoteItems).set(values).where(eq(quoteItems.id, current.id));
      else if (mode === "add") await tx.insert(quoteItems).values({ quoteId: draft.id, variantId, ...values });
    }
    await tx.update(quotes).set({ updatedAt: new Date() }).where(and(eq(quotes.id, draft.id), commerceOwner(quotes, identity), eq(quotes.status, "draft")));
  });
  return listQuoteLines(identity);
}

export async function addVariantToQuote(identity: CommerceInput, variantId: string, quantity: number) {
  return writeQuoteLine(identity, variantId, quantity, "add");
}
export async function setQuoteLineQuantity(identity: CommerceInput, variantId: string, quantity: number) {
  return writeQuoteLine(identity, variantId, quantity, quantity === 0 ? "remove" : "set");
}
export async function removeQuoteLine(identity: CommerceInput, variantId: string) {
  return writeQuoteLine(identity, variantId, 0, "remove");
}

export async function clearQuote(identity: CommerceInput) {
  await getDb().transaction(async (tx) => {
    await lockCommerce(tx, identity);
    const [draft] = await tx.select().from(quotes)
      .where(and(commerceOwner(quotes, identity), eq(quotes.status, "draft"))).limit(1);
    if (!draft) return;
    await tx.delete(quoteItems).where(eq(quoteItems.quoteId, draft.id));
    await tx.update(quotes).set({ updatedAt: new Date() })
      .where(and(eq(quotes.id, draft.id), commerceOwner(quotes, identity)));
  });
  return [];
}
