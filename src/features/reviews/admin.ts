import { count, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { productReviews, products } from "@/lib/db/schema";
import { canAccessAdmin } from "@/lib/staff/rbac";
import type { StaffRole } from "@/lib/staff/types";

export const ADMIN_REVIEW_PAGE_SIZE = 50;

export async function listAdminReviews(role: StaffRole, pageParam?: string) {
  if (!canAccessAdmin(role, "reviews", "read")) throw new Error("This role cannot view reviews.");
  const db = getDb();
  const [totalRow] = await db
    .select({ total: count() })
    .from(productReviews)
    .innerJoin(products, eq(products.id, productReviews.productId));
  const total = Number(totalRow?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_REVIEW_PAGE_SIZE));
  const parsedPage = Number.parseInt(pageParam ?? "1", 10);
  const page = Math.min(Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1, totalPages);
  const rows = await db
    .select({ id: productReviews.id, productId: productReviews.productId, productName: products.name, productSlug: products.slug, rating: productReviews.rating, title: productReviews.title, body: productReviews.body, displayName: productReviews.displayName, status: productReviews.status, createdAt: productReviews.createdAt })
    .from(productReviews)
    .innerJoin(products, eq(products.id, productReviews.productId))
    .orderBy(desc(productReviews.createdAt))
    .limit(ADMIN_REVIEW_PAGE_SIZE)
    .offset((page - 1) * ADMIN_REVIEW_PAGE_SIZE);
  return { rows, page, totalPages };
}

export async function setReviewStatus(role: StaffRole, reviewId: string, status: "approved" | "rejected") {
  if (!canAccessAdmin(role, "reviews", "write")) throw new Error("This role cannot moderate reviews.");
  await getDb().update(productReviews).set({ status, updatedAt: new Date() }).where(eq(productReviews.id, reviewId));
}
