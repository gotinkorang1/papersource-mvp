"use server";

import { z } from "zod";
import { requireCustomer } from "@/lib/customer/require";
import { createProductReview } from "./repository";

const reviewSchema = z.object({
  productId: z.uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(100).optional(),
  body: z.string().trim().min(10, "Please share at least 10 characters.").max(2000),
  displayName: z.string().trim().min(1).max(80),
});

export type ReviewActionState = { success?: boolean; message?: string; errors?: Record<string, string[]> };

export async function submitReviewAction(_previous: ReviewActionState, formData: FormData): Promise<ReviewActionState> {
  const actor = await requireCustomer();
  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: "Check the highlighted review fields.", errors: parsed.error.flatten().fieldErrors };
  try {
    await createProductReview({ ...parsed.data, profileId: actor.profileId });
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique")) return { message: "You have already reviewed this product." };
    return { message: "We could not submit your review. Please try again." };
  }
  return { success: true, message: "Thanks — your review is awaiting approval." };
}
