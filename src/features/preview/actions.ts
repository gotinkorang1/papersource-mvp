"use server";

import { z } from "zod";
import { addVariantToCart, listCartLines } from "@/features/cart/repository";
import { addVariantToQuote, clearQuote, listQuoteLines } from "@/features/quotations/repository";
import { clearCart } from "@/features/cart/repository";
import { isDatabaseConfigured } from "@/lib/db/client";
import { readCommerceIdentity } from "@/lib/customer/commerce";
import type { CartLinePreview, QuoteLinePreview } from "@/types/catalogue";

const addLineSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(9_999),
});

export type DualPathState = {
  cartLines: CartLinePreview[];
  quoteLines: QuoteLinePreview[];
  syncError?: string;
};

async function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await new Promise<T>((resolve, reject) => {
      timer = setTimeout(() => reject(new Error("Basket hydration timed out.")), milliseconds);
      promise.then(resolve, reject);
    });
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function loadGuestDualPath(): Promise<DualPathState> {
  if (!isDatabaseConfigured()) {
    return { cartLines: [], quoteLines: [] };
  }

  try {
    const sessionId = await withTimeout(readCommerceIdentity(), 2_000);
    if (!sessionId.profileId && !sessionId.sessionId) {
      return { cartLines: [], quoteLines: [] };
    }

    const [cartLines, quoteLines] = await withTimeout(Promise.all([
      listCartLines(sessionId),
      listQuoteLines(sessionId),
    ]), 2_000);

    return { cartLines, quoteLines };
  } catch {
    return {
      cartLines: [],
      quoteLines: [],
      syncError: "Cart and quote sync is temporarily unavailable. Please try again shortly.",
    };
  }
}

export async function addToCartAction(input: {
  variantId: string;
  quantity: number;
}): Promise<DualPathState> {
  const parsed = addLineSchema.parse(input);
  const sessionId = await readCommerceIdentity(true);
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
  const sessionId = await readCommerceIdentity(true);
  const quoteLines = await addVariantToQuote(
    sessionId,
    parsed.variantId,
    parsed.quantity,
  );
  const cartLines = await listCartLines(sessionId);
  return { cartLines, quoteLines };
}

export async function clearCartAction(): Promise<DualPathState> {
  const sessionId = await readCommerceIdentity(true);
  await clearCart(sessionId);
  return { cartLines: [], quoteLines: await listQuoteLines(sessionId) };
}

export async function clearQuoteAction(): Promise<DualPathState> {
  const sessionId = await readCommerceIdentity(true);
  await clearQuote(sessionId);
  return { cartLines: await listCartLines(sessionId), quoteLines: [] };
}
