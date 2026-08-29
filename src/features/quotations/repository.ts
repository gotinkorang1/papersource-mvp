import { and, eq } from "drizzle-orm";
import {
  loadSellableVariant,
  previewUnitPrice,
} from "@/features/catalogue/variant-context";
import { resolveUnitPrice } from "@/features/catalogue/pricing";
import { getDb } from "@/lib/db/client";
import { quoteItems, quotes } from "@/lib/db/schema";
import type { QuoteLinePreview } from "@/types/catalogue";

async function getDraftQuote(sessionId: string) {
  const db = getDb();
  const [draft] = await db
    .select()
    .from(quotes)
    .where(and(eq(quotes.sessionId, sessionId), eq(quotes.status, "draft")))
    .limit(1);
  return draft ?? null;
}

export async function listQuoteLines(
  sessionId: string,
): Promise<QuoteLinePreview[]> {
  const draft = await getDraftQuote(sessionId);
  if (!draft) {
    return [];
  }

  const db = getDb();
  const items = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, draft.id));

  const lines: QuoteLinePreview[] = [];
  for (const item of items) {
    const context = item.variantId
      ? await loadSellableVariant(item.variantId)
      : null;
    lines.push({
      id: item.variantId ?? item.id,
      name: item.nameSnapshot,
      sku: item.skuSnapshot,
      specLine: item.specSnapshot ?? item.nameSnapshot,
      quantity: item.quantity,
      unitPricePesewas: item.unitPrice,
      unitLabel: context?.variant.unitLabel ?? "each",
    });
  }

  return lines;
}

export async function addVariantToQuote(
  sessionId: string,
  variantId: string,
  quantity: number,
) {
  const context = await loadSellableVariant(variantId);
  if (!context) {
    throw new Error("That product is not available for quotation.");
  }

  const db = getDb();
  await db.transaction(async (tx) => {
    let [draft] = await tx
      .select()
      .from(quotes)
      .where(and(eq(quotes.sessionId, sessionId), eq(quotes.status, "draft")))
      .limit(1);

    if (!draft) {
      const inserted = await tx
        .insert(quotes)
        .values({ status: "draft", sessionId })
        .returning();
      draft = inserted[0];
    }

    if (!draft) {
      throw new Error("Could not create a draft quotation for this session.");
    }

    const items = await tx
      .select()
      .from(quoteItems)
      .where(eq(quoteItems.quoteId, draft.id));
    const current = items.find((item) => item.variantId === variantId);
    const nextQuantity = (current?.quantity ?? 0) + quantity;
    const nextPrice = resolveUnitPrice({
      quantity: nextQuantity,
      baseUnitPricePesewas: context.variant.baseUnitPrice,
      tiers: context.tiers,
    });

    if (current) {
      await tx
        .update(quoteItems)
        .set({
          quantity: nextQuantity,
          unitPrice: nextPrice.unitPricePesewas,
          lineTotal:
            nextPrice.unitPricePesewas === null
              ? null
              : nextPrice.unitPricePesewas * nextQuantity,
          nameSnapshot: context.product.name,
          skuSnapshot: context.variant.sku,
          specSnapshot: context.specLine,
        })
        .where(eq(quoteItems.id, current.id));
    } else {
      const unitPrice = previewUnitPrice(
        quantity,
        context.variant.baseUnitPrice,
        context.tiers,
      );
      await tx.insert(quoteItems).values({
        quoteId: draft.id,
        variantId,
        nameSnapshot: context.product.name,
        skuSnapshot: context.variant.sku,
        specSnapshot: context.specLine,
        quantity,
        unitPrice,
        lineTotal: unitPrice === null ? null : unitPrice * quantity,
      });
    }

    await tx
      .update(quotes)
      .set({ updatedAt: new Date() })
      .where(eq(quotes.id, draft.id));
  });

  return listQuoteLines(sessionId);
}

export async function setQuoteLineQuantity(
  sessionId: string,
  variantId: string,
  quantity: number,
) {
  if (quantity < 1) {
    return removeQuoteLine(sessionId, variantId);
  }

  const context = await loadSellableVariant(variantId);
  if (!context) {
    throw new Error("That product is not available for quotation.");
  }

  const draft = await getDraftQuote(sessionId);
  if (!draft) {
    return [];
  }

  const nextPrice = resolveUnitPrice({
    quantity,
    baseUnitPricePesewas: context.variant.baseUnitPrice,
    tiers: context.tiers,
  });

  const db = getDb();
  await db
    .update(quoteItems)
    .set({
      quantity,
      unitPrice: nextPrice.unitPricePesewas,
      lineTotal:
        nextPrice.unitPricePesewas === null
          ? null
          : nextPrice.unitPricePesewas * quantity,
      nameSnapshot: context.product.name,
      skuSnapshot: context.variant.sku,
      specSnapshot: context.specLine,
    })
    .where(
      and(eq(quoteItems.quoteId, draft.id), eq(quoteItems.variantId, variantId)),
    );

  return listQuoteLines(sessionId);
}

export async function removeQuoteLine(sessionId: string, variantId: string) {
  const draft = await getDraftQuote(sessionId);
  if (!draft) {
    return [];
  }

  const db = getDb();
  await db
    .delete(quoteItems)
    .where(
      and(eq(quoteItems.quoteId, draft.id), eq(quoteItems.variantId, variantId)),
    );
  return listQuoteLines(sessionId);
}

export { getDraftQuote };
