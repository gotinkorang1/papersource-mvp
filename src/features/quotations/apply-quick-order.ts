import { addVariantToCart, listCartLines } from "@/features/cart/repository";
import {
  findSellableVariantIdBySku,
  loadSellableVariant,
  previewUnitPrice,
} from "@/features/catalogue/variant-context";
import { addVariantToQuote } from "@/features/quotations/repository";
import type { CommerceInput } from "@/lib/customer/commerce-identity";
import type { QuickOrderRow } from "@/features/quotations/quick-order";

export type QuickOrderDestination = "quote" | "cart";

export type QuickOrderApplyResult = {
  added: number;
  unknown: string[];
  cartBlocked: string[];
};

export async function applyQuickOrderLines(input: {
  sessionId: CommerceInput;
  destination: QuickOrderDestination;
  rows: QuickOrderRow[];
}): Promise<QuickOrderApplyResult> {
  const unknown: string[] = [];
  const cartBlocked: string[] = [];
  let added = 0;

  for (const row of input.rows) {
    const variantId = await findSellableVariantIdBySku(row.sku);
    const context = variantId ? await loadSellableVariant(variantId) : null;
    if (!context) {
      unknown.push(row.sku);
      continue;
    }

    if (input.destination === "cart") {
      const cartLines = await listCartLines(input.sessionId);
      const existingQuantity = cartLines.find((line) => line.id === context.variant.id)?.quantity ?? 0;
      const unitPrice = previewUnitPrice(
        existingQuantity + row.quantity,
        context.variant.baseUnitPrice,
        context.tiers,
      );
      if (unitPrice === null) {
        cartBlocked.push(row.sku);
        continue;
      }
      await addVariantToCart(input.sessionId, context.variant.id, row.quantity);
      added += 1;
      continue;
    }

    await addVariantToQuote(input.sessionId, context.variant.id, row.quantity);
    added += 1;
  }

  return { added, unknown, cartBlocked };
}
