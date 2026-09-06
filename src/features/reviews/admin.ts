import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { productReviews, products } from "@/lib/db/schema";
import { canAccessAdmin } from "@/lib/staff/rbac";
import type { StaffRole } from "@/lib/staff/types";

export async function listAdminReviews(role: StaffRole) {
  if (!canAccessAdmin(role, "reviews", "read")) throw new Error("This role cannot view reviews.");
  return getDb().select({ id: productReviews.id, productId: productReviews.productId, productName: products.name, productSlug: products.slug, rating: productReviews.rating, title: productReviews.title, body: productReviews.body, displayName: productReviews.displayName, status: productReviews.status, createdAt: productReviews.createdAt })
    .from(productReviews).innerJoin(products, eq(products.id, productReviews.productId)).orderBy(desc(productReviews.createdAt));
}

export async function setReviewStatus(role: StaffRole, reviewId: string, status: "approved" | "rejected") {
  if (!canAccessAdmin(role, "reviews", "write")) throw new Error("This role cannot moderate reviews.");
  await getDb().update(productReviews).set({ status, updatedAt: new Date() }).where(eq(productReviews.id, reviewId));
}
