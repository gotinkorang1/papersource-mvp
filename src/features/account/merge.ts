import "server-only";
import { and, eq, isNull, ne } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { carts, cartItems, orders, quotes, quoteItems } from "@/lib/db/schema";
import { lockCommerce, normalizeCommerceIdentity } from "@/lib/customer/commerce-identity";

/** Server-internal only: profileId is verified; sessionId is read from the HTTP-only guest cookie. */
export async function mergeGuestCommerce(input: { profileId: string; sessionId: string | null }) {
  const identity = normalizeCommerceIdentity(input);
  if (!identity.profileId || !identity.sessionId) return;
  const { profileId, sessionId } = identity;
  await getDb().transaction(async (tx) => {
    await lockCommerce(tx, identity);
    const [guestCart] = await tx.select().from(carts).where(and(eq(carts.sessionId, sessionId), isNull(carts.profileId))).limit(1);
    if (guestCart) {
      let [profileCart] = await tx.select().from(carts).where(eq(carts.profileId, profileId)).limit(1);
      if (!profileCart) [profileCart] = await tx.insert(carts).values({ profileId, sessionId: null }).returning();
      const guestLines = await tx.select().from(cartItems).where(eq(cartItems.cartId, guestCart.id));
      for (const line of guestLines) {
        const [existing] = await tx.select().from(cartItems).where(and(eq(cartItems.cartId, profileCart.id), eq(cartItems.variantId, line.variantId)));
        const quantity = (existing?.quantity ?? 0) + line.quantity;
        if (quantity > 9_999) throw new Error("Reduce your cart quantity before signing in.");
        if (existing) await tx.update(cartItems).set({ quantity }).where(eq(cartItems.id, existing.id));
        else await tx.insert(cartItems).values({ cartId: profileCart.id, variantId: line.variantId, quantity });
      }
      await tx.update(carts).set({ sessionId: null, updatedAt: new Date() }).where(eq(carts.id, profileCart.id));
      await tx.delete(carts).where(and(eq(carts.id, guestCart.id), isNull(carts.profileId)));
    }
    const [guestQuote] = await tx.select().from(quotes).where(and(eq(quotes.sessionId, sessionId), isNull(quotes.profileId), eq(quotes.status, "draft"))).limit(1);
    if (guestQuote) {
      let [profileQuote] = await tx.select().from(quotes).where(and(eq(quotes.profileId, profileId), eq(quotes.status, "draft"))).limit(1);
      if (!profileQuote) [profileQuote] = await tx.insert(quotes).values({ profileId, sessionId: null, status: "draft" }).returning();
      const lines = await tx.select().from(quoteItems).where(eq(quoteItems.quoteId, guestQuote.id));
      for (const line of lines) {
        const [existing] = line.variantId ? await tx.select().from(quoteItems).where(and(eq(quoteItems.quoteId, profileQuote.id), eq(quoteItems.variantId, line.variantId))).limit(1) : [];
        const quantity = (existing?.quantity ?? 0) + line.quantity;
        if (quantity > 9_999) throw new Error("Reduce your quote quantity before signing in.");
        if (existing) {
          await tx.update(quoteItems).set({ quantity, lineTotal: existing.unitPrice === null ? null : existing.unitPrice * quantity }).where(eq(quoteItems.id, existing.id));
        } else {
          await tx.insert(quoteItems).values({ quoteId: profileQuote.id,
            variantId: line.variantId, nameSnapshot: line.nameSnapshot, skuSnapshot: line.skuSnapshot,
            specSnapshot: line.specSnapshot, quantity: line.quantity,
            unitPrice: line.unitPrice, lineTotal: line.lineTotal, notes: line.notes });
        }
      }
      await tx.update(quotes).set({ sessionId: null, updatedAt: new Date() }).where(eq(quotes.id, profileQuote.id));
      await tx.delete(quotes).where(and(eq(quotes.id, guestQuote.id), isNull(quotes.profileId), eq(quotes.status, "draft")));
    }
    await tx.update(quotes).set({ profileId, updatedAt: new Date() })
      .where(and(eq(quotes.sessionId, sessionId), isNull(quotes.profileId), ne(quotes.status, "draft")));
    await tx.update(orders).set({ profileId, updatedAt: new Date() })
      .where(and(eq(orders.sessionId, sessionId), isNull(orders.profileId)));
  });
}
