import type { Metadata } from "next";
import { AdminError } from "@/components/admin/field";
import { listAdminReviews } from "@/features/reviews/admin";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const actor = await requireStaffArea("reviews", "read");
  const reviews = await listAdminReviews(actor.role);
  const canWrite = canAccessAdmin(actor.role, "reviews", "write");
  const { error } = await searchParams;
  return <main><p className="text-sm tracking-[0.16em] text-slate uppercase">Engagement</p><h1 className="mt-2 font-heading text-3xl text-ink">Product reviews</h1><p className="mt-3 max-w-2xl text-slate">Approve helpful customer feedback before it appears publicly. Rejected reviews remain hidden.</p><AdminError error={error} /><div className="mt-8 space-y-4">{reviews.length ? reviews.map((review) => <article key={review.id} className="rounded-xl border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.14em] text-slate">{review.status} · {review.productName}</p><h2 className="mt-2 text-lg font-medium text-ink">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)} {review.title ? ` — ${review.title}` : ""}</h2><p className="mt-2 text-sm text-slate">{review.body}</p><p className="mt-3 text-xs text-slate">{review.displayName} · {new Date(review.createdAt).toLocaleDateString("en-GH")}</p></div>{canWrite && review.status === "pending" ? <div className="flex shrink-0 gap-2"><form action="/admin/reviews/mutate" method="post"><input type="hidden" name="reviewId" value={review.id} /><input type="hidden" name="status" value="approved" /><button className="min-h-10 rounded-md bg-ink px-3 py-2 text-xs font-medium text-white">Approve</button></form><form action="/admin/reviews/mutate" method="post"><input type="hidden" name="reviewId" value={review.id} /><input type="hidden" name="status" value="rejected" /><button className="min-h-10 rounded-md border border-border px-3 py-2 text-xs font-medium text-ink">Reject</button></form></div> : null}</div></article>) : <div className="rounded-xl border border-dashed border-border p-8 text-sm text-slate">No reviews have been submitted yet.</div>}</div></main>;
}
