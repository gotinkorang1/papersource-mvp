import { and, desc, eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { productReviews, products } from "@/lib/db/schema";

export type ProductReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  displayName: string;
  createdAt: Date;
};

export async function listApprovedProductReviews(productId: string): Promise<ProductReview[]> {
  if (!isDatabaseConfigured()) return [];
  return getDb().select({ id: productReviews.id, rating: productReviews.rating, title: productReviews.title, body: productReviews.body, displayName: productReviews.displayName, createdAt: productReviews.createdAt })
    .from(productReviews)
    .where(and(eq(productReviews.productId, productId), eq(productReviews.status, "approved")))
    .orderBy(desc(productReviews.createdAt));
}

export async function createProductReview(input: { productId: string; profileId: string; rating: number; title?: string; body: string; displayName: string }) {
  const [product] = await getDb().select({ id: products.id }).from(products).where(eq(products.id, input.productId)).limit(1);
  if (!product) throw new Error("Product not found.");
  await getDb().insert(productReviews).values({ ...input, title: input.title || null, status: "pending" });
}
