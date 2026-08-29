"use server";

import { z } from "zod";
import { addVariantToCart, listCartLines } from "@/features/cart/repository";
import { addVariantToQuote, listQuoteLines } from "@/features/quotations/repository";
import { isDatabaseConfigured } from "@/lib/db/client";
import {
  getOrCreateGuestSessionId,
  readGuestSessionId,
} from "@/lib/session/guest";
import type { CartLinePreview, QuoteLinePreview } from "@/types/catalogue";

const addLineSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(9_999),
});

export type DualPathState = {
  cartLines: CartLinePreview[];
  quoteLines: QuoteLinePreview[];
};

export async function loadGuestDualPath(): Promise<DualPathState> {
  if (!isDatabaseConfigured()) {
    return { cartLines: [], quoteLines: [] };
  }

  const sessionId = await readGuestSessionId();
  if (!sessionId) {
    return { cartLines: [], quoteLines: [] };
  }

  const [cartLines, quoteLines] = await Promise.all([
    listCartLines(sessionId),
    listQuoteLines(sessionId),
  ]);

  return { cartLines, quoteLines };
}

export async function addToCartAction(input: {
  variantId: string;
  quantity: number;
}): Promise<DualPathState> {
  const parsed = addLineSchema.parse(input);
  const sessionId = await getOrCreateGuestSessionId();
  const cartLines = await addVariantToCart(
    sessionId,
    parsed.variantId,
    parsed.quantity,
  );
  const quoteLines = await listQuoteLines(sessionId);
  return { cartLines, quoteLines };
}

export async function addToQuoteAction(input: {
  variantId: string;
  quantity: number;
}): Promise<DualPathState> {
  const parsed = addLineSchema.parse(input);
  const sessionId = await getOrCreateGuestSessionId();
  const quoteLines = await addVariantToQuote(
    sessionId,
    parsed.variantId,
    parsed.quantity,
  );
  const cartLines = await listCartLines(sessionId);
  return { cartLines, quoteLines };
}
