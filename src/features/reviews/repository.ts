import { and, desc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { orderItems, orders, productReviews, productVariants, products } from "@/lib/db/schema";

export type ProductReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  displayName: string;
  createdAt: Date;
  verifiedPurchase: boolean;
};

export async function listApprovedProductReviews(productId: string): Promise<ProductReview[]> {
  if (!isDatabaseConfigured()) return [];
  return getDb().select({ id: productReviews.id, rating: productReviews.rating, title: productReviews.title, body: productReviews.body, displayName: productReviews.displayName, createdAt: productReviews.createdAt, verifiedPurchase: productReviews.verifiedPurchase })
    .from(productReviews)
    .where(and(eq(productReviews.productId, productId), eq(productReviews.status, "approved"), eq(productReviews.verifiedPurchase, true)))
    .orderBy(desc(productReviews.createdAt));
}

export async function findDeliveredOrderForReview(profileId: string, productId: string) {
  const [eligible] = await getDb()
    .select({ orderId: orders.id })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .innerJoin(productVariants, eq(productVariants.id, orderItems.variantId))
    .where(and(eq(orders.profileId, profileId), eq(orders.status, "delivered"), eq(productVariants.productId, productId)))
    .limit(1);
  return eligible?.orderId ?? null;
}

export async function createProductReview(input: { productId: string; profileId: string; rating: number; title?: string; body: string; displayName: string }) {
  const [product] = await getDb().select({ id: products.id }).from(products).where(eq(products.id, input.productId)).limit(1);
  if (!product) throw new Error("Product not found.");
  const orderId = await findDeliveredOrderForReview(input.profileId, input.productId);
  if (!orderId) throw new Error("A delivered order for this product is required.");
  await getDb().insert(productReviews).values({ ...input, orderId, verifiedPurchase: true, title: input.title || null, status: "pending" });
}
