import "server-only";
import { and, eq } from "drizzle-orm";
import { loadSellableVariant, previewUnitPrice } from "@/features/catalogue/variant-context";
import { resolveUnitPrice } from "@/features/catalogue/pricing";
import { getDb } from "@/lib/db/client";
import { cartItems, carts } from "@/lib/db/schema";
import { commerceOwner, commerceInsertOwner, lockCommerce, type CommerceInput, type CommerceTransaction } from "@/lib/customer/commerce-identity";
import type { CartLinePreview } from "@/types/catalogue";

export async function listCartLines(identity: CommerceInput): Promise<CartLinePreview[]> {
  const db = getDb();
  const [cart] = await db.select().from(carts).where(commerceOwner(carts, identity)).limit(1);
  if (!cart) return [];
  const items = await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id));
  const lines: CartLinePreview[] = [];
  for (const item of items) {
    const context = await loadSellableVariant(item.variantId);
    if (!context) continue;
    lines.push({
      id: item.variantId, name: context.product.name, specLine: context.specLine,
      quantity: item.quantity,
      unitPricePesewas: previewUnitPrice(item.quantity, context.variant.baseUnitPrice, context.tiers) ?? context.variant.baseUnitPrice,
      unitLabel: context.variant.unitLabel,
    });
  }
  return lines;
}

async function mutateCart(identity: CommerceInput, create: boolean, mutate: (tx: CommerceTransaction, cartId: string) => Promise<void>) {
  await getDb().transaction(async (tx) => {
    await lockCommerce(tx, identity);
    let [cart] = await tx.select().from(carts).where(commerceOwner(carts, identity)).limit(1);
    if (!cart && create) {
      [cart] = await tx.insert(carts).values(commerceInsertOwner(identity)).returning();
    }
    if (!cart) return;
    await mutate(tx, cart.id);
    await tx.update(carts).set({ updatedAt: new Date() }).where(and(eq(carts.id, cart.id), commerceOwner(carts, identity)));
  });
}

function validQuantity(quantity: number) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9_999) throw new Error("Use a quantity between 1 and 9,999.");
}

export async function addVariantToCart(identity: CommerceInput, variantId: string, quantity: number) {
  validQuantity(quantity);
  const context = await loadSellableVariant(variantId);
  if (!context) throw new Error("That product is not available for retail checkout.");
  await mutateCart(identity, true, async (tx, cartId) => {
    const [current] = await tx.select().from(cartItems).where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)));
    const nextQuantity = (current?.quantity ?? 0) + quantity;
    validQuantity(nextQuantity);
    const price = resolveUnitPrice({ quantity: nextQuantity, baseUnitPricePesewas: context.variant.baseUnitPrice, tiers: context.tiers });
    if (price.unitPricePesewas === null) throw new Error("This quantity requires a quotation.");
    if (current) await tx.update(cartItems).set({ quantity: nextQuantity }).where(eq(cartItems.id, current.id));
    else await tx.insert(cartItems).values({ cartId, variantId, quantity });
  });
  return listCartLines(identity);
}

export async function setCartLineQuantity(identity: CommerceInput, variantId: string, quantity: number) {
  if (quantity === 0) return removeCartLine(identity, variantId);
  validQuantity(quantity);
  await mutateCart(identity, false, async (tx, cartId) => {
    await tx.update(cartItems).set({ quantity }).where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)));
  });
  return listCartLines(identity);
}

export async function removeCartLine(identity: CommerceInput, variantId: string) {
  await mutateCart(identity, false, async (tx, cartId) => {
    await tx.delete(cartItems).where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)));
  });
  return listCartLines(identity);
}

export async function clearCart(identity: CommerceInput) {
  await mutateCart(identity, false, async (tx, cartId) => {
    await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));
  });
  return [];
}
