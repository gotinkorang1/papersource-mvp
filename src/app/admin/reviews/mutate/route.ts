import { NextResponse } from "next/server";
import { recordAdminAudit } from "@/features/admin/audit";
import { setReviewStatus } from "@/features/reviews/admin";
import { readStaffActor } from "@/lib/staff/require";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const next = new URL("/admin/reviews", origin);
  const actor = await readStaffActor();
  if (!actor) return NextResponse.redirect(new URL("/admin/login", origin), 303);
  const form = await request.formData();
  const id = String(form.get("reviewId") ?? "");
  const status = String(form.get("status") ?? "");
  try {
    if (!/^[0-9a-f-]{36}$/i.test(id) || !["approved", "rejected"].includes(status)) throw new Error("Invalid review action.");
    await setReviewStatus(actor.role, id, status as "approved" | "rejected");
    await recordAdminAudit({ actorProfileId: actor.profileId, action: `review_${status}`, resourceType: "product_review", resourceId: id });
  } catch (error) {
    next.searchParams.set("error", error instanceof Error && error.message === "Invalid review action." ? error.message : "Could not update review. Please try again.");
  }
  return NextResponse.redirect(next, 303);
}
