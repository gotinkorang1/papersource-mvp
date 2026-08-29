import { and, eq, sql } from "drizzle-orm";
import {
  loadSellableVariant,
  previewUnitPrice,
} from "@/features/catalogue/variant-context";
import { getDb } from "@/lib/db/client";
import { cartItems, carts } from "@/lib/db/schema";
import type { CartLinePreview } from "@/types/catalogue";

export async function listCartLines(sessionId: string): Promise<CartLinePreview[]> {
  const db = getDb();
  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.sessionId, sessionId))
    .limit(1);

  if (!cart) {
    return [];
  }

  const items = await db
    .select()
    .from(cartItems)
    .where(eq(cartItems.cartId, cart.id));

  const lines: CartLinePreview[] = [];
  for (const item of items) {
    const context = await loadSellableVariant(item.variantId);
    if (!context) {
      continue;
    }
    lines.push({
      id: item.variantId,
      name: context.product.name,
      specLine: context.specLine,
      quantity: item.quantity,
      unitPricePesewas:
        previewUnitPrice(
          item.quantity,
          context.variant.baseUnitPrice,
          context.tiers,
        ) ?? context.variant.baseUnitPrice,
      unitLabel: context.variant.unitLabel,
    });
  }

  return lines;
}

export async function addVariantToCart(
  sessionId: string,
  variantId: string,
  quantity: number,
) {
  const context = await loadSellableVariant(variantId);
  if (!context) {
    throw new Error("That product is not available for retail checkout.");
  }

  const db = getDb();
  await db.transaction(async (tx) => {
    let [cart] = await tx
      .select()
      .from(carts)
      .where(eq(carts.sessionId, sessionId))
      .limit(1);

    if (!cart) {
      const inserted = await tx
        .insert(carts)
        .values({ sessionId })
        .onConflictDoNothing({ target: carts.sessionId })
        .returning();
      cart = inserted[0];
      if (!cart) {
        [cart] = await tx
          .select()
          .from(carts)
          .where(eq(carts.sessionId, sessionId))
          .limit(1);
      }
    }

    if (!cart) {
      throw new Error("Could not create a cart for this session.");
    }

    await tx
      .insert(cartItems)
      .values({
        cartId: cart.id,
        variantId,
        quantity,
      })
      .onConflictDoUpdate({
        target: [cartItems.cartId, cartItems.variantId],
        set: { quantity: sql`${cartItems.quantity} + ${quantity}` },
      });

    await tx
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cart.id));
  });

  return listCartLines(sessionId);
}

export async function setCartLineQuantity(
  sessionId: string,
  variantId: string,
  quantity: number,
) {
  if (quantity < 1) {
    return removeCartLine(sessionId, variantId);
  }

  const db = getDb();
  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.sessionId, sessionId))
    .limit(1);
  if (!cart) {
    return [];
  }

  await db
    .update(cartItems)
    .set({ quantity })
    .where(
      and(eq(cartItems.cartId, cart.id), eq(cartItems.variantId, variantId)),
    );
  return listCartLines(sessionId);
}

export async function removeCartLine(sessionId: string, variantId: string) {
  const db = getDb();
  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.sessionId, sessionId))
    .limit(1);
  if (!cart) {
    return [];
  }

  await db
    .delete(cartItems)
    .where(
      and(eq(cartItems.cartId, cart.id), eq(cartItems.variantId, variantId)),
    );
  return listCartLines(sessionId);
}

export async function clearCart(sessionId: string) {
  const db = getDb();
  const [cart] = await db
    .select()
    .from(carts)
    .where(eq(carts.sessionId, sessionId))
    .limit(1);
  if (!cart) {
    return [];
  }

  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  return [];
}
