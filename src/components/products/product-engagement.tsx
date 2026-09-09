"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitReviewAction, type ReviewActionState } from "@/features/reviews/actions";
import type { ProductReview } from "@/features/reviews/repository";

function Stars({ value, label }: { value: number; label?: string }) {
  return <span aria-label={label ?? `${value} out of 5 stars`} className="inline-flex gap-0.5 text-amber-500">{[1, 2, 3, 4, 5].map((star) => <span key={star} aria-hidden>{star <= value ? "★" : "☆"}</span>)}</span>;
}

export function ProductEngagement({ productId, productName, reviews, nextPath = "/" }: { productId: string; productName: string; reviews: ProductReview[]; nextPath?: string }) {
  const [shared, setShared] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [state, formAction, pending] = useActionState<ReviewActionState, FormData>(submitReviewAction, {});
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const share = async () => {
    const url = window.location.href;
    setShareError(false);
    if (navigator.share) {
      try { await navigator.share({ title: productName, url }); } catch { /* User cancelled the share sheet. */ }
    }
    else {
      try {
        await navigator.clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 2400);
      } catch {
        setShareError(true);
      }
    }
  };
  return <section className="mt-14 border-t border-border pt-10" aria-labelledby="reviews-heading">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium uppercase tracking-[0.16em] text-slate">Customer experience</p><h2 id="reviews-heading" className="mt-2 text-2xl text-ink">Reviews & recommendations</h2><div className="mt-2 flex items-center gap-2 text-sm text-slate">{reviews.length ? <><Stars value={Math.round(average)} label={`${average.toFixed(1)} out of 5 stars`} /><span>{average.toFixed(1)} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span></> : <span>No reviews yet — be the first.</span>}</div></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={share} className="min-h-10 rounded-md border border-ink px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-cream">{shared ? "Link copied" : "Share product"}</button><button type="button" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${productName} — ${window.location.href}`)}`, "_blank", "noopener,noreferrer")} className="inline-flex min-h-10 items-center rounded-md bg-[#128c7e] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">WhatsApp</button><button type="button" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank", "noopener,noreferrer")} className="inline-flex min-h-10 items-center rounded-md bg-[#1877f2] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">Facebook</button>{shareError ? <span role="status" className="basis-full text-xs text-red-700 dark:text-red-300">Copying is unavailable in this browser. Use the page menu to share this link.</span> : null}</div></div>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.85fr]"> <div className="space-y-4">{reviews.length ? reviews.map((review) => <article key={review.id} className="rounded-xl border border-border bg-card p-5"><div className="flex flex-wrap items-center justify-between gap-2"><Stars value={review.rating} /><span className="text-xs text-slate">{review.displayName} · {review.createdAt.toLocaleDateString("en-GH", { month: "short", year: "numeric" })}</span></div>{review.title ? <h3 className="mt-3 font-medium text-ink">{review.title}</h3> : null}<p className="mt-2 text-sm leading-relaxed text-slate">{review.body}</p></article>) : <div className="rounded-xl border border-dashed border-border p-6 text-sm text-slate">Verified customer reviews will appear here after moderation.</div>}</div>
      <div className="rounded-xl border border-border bg-card p-6"><h3 className="text-lg font-medium text-ink">Have you used this product?</h3><p className="mt-2 text-sm text-slate">Sign in to leave a review. Reviews are checked before they are published.</p><form action={formAction} className="mt-5 space-y-4"><input type="hidden" name="productId" value={productId} /><label className="block text-sm font-medium text-ink">Rating<select name="rating" defaultValue="5" className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-ink"><option value="5">5 — Excellent</option><option value="4">4 — Very good</option><option value="3">3 — Good</option><option value="2">2 — Fair</option><option value="1">1 — Poor</option></select></label><label className="block text-sm font-medium text-ink">Your name<input name="displayName" required maxLength={80} className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-ink" /></label><label className="block text-sm font-medium text-ink">Review<textarea name="body" required minLength={10} maxLength={2000} rows={4} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-ink" placeholder="What should another customer know?" /></label><label className="block text-sm font-medium text-ink">Title <span className="font-normal text-slate">(optional)</span><input name="title" maxLength={100} className="mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-ink" /></label>{state.message ? <p className={state.success ? "text-sm text-emerald-700 dark:text-emerald-300" : "text-sm text-red-700 dark:text-red-300"} role="status">{state.message}</p> : null}<button disabled={pending} className="min-h-11 w-full rounded-md bg-ink px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60">{pending ? "Submitting…" : "Submit review"}</button><p className="text-xs text-slate">Already have an account? <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="underline underline-offset-2">Sign in</Link></p></form></div>
    </div>
  </section>;
}
