import Link from "next/link";
import { BadgeCheck, Clock, PackageCheck, Quote, Receipt, Star } from "lucide-react";
import type { FeaturedReview } from "@/features/reviews/repository";

/**
 * Service commitments shown when there are not yet enough verified reviews.
 * These are promises PaperSource makes, not customer quotes, so they are never
 * presented with names, quote marks or star ratings.
 */
const promises = [
  { icon: Receipt, title: "Clear, VAT-inclusive prices", body: "Retail prices include VAT. Bulk and business orders get a written quotation before you commit." },
  { icon: Clock, title: "Quick quote turnaround", body: "Send your list and quantities; our team prices it and replies with availability and delivery timing." },
  { icon: PackageCheck, title: "Pickup or delivery", body: "Collect from the shop for free or choose delivery across Accra, Tema and beyond." },
];

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5 text-ochre" role="img" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className={index < rating ? "size-3.5 fill-current" : "size-3.5 opacity-30"} aria-hidden />
      ))}
    </span>
  );
}

export function Testimonials({ reviews = [] }: { reviews?: FeaturedReview[] }) {
  const hasReviews = reviews.length > 0;
  return (
    <section className="border-y border-border bg-cream/60 py-16 md:py-20" aria-labelledby="customer-stories">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm tracking-[0.16em] text-slate uppercase">{hasReviews ? "From verified buyers" : "Our commitments"}</p>
            <h2 id="customer-stories" className="mt-3 max-w-xl text-3xl text-ink md:text-4xl">A dependable supply partner, not another tab to manage.</h2>
          </div>
          <p className="max-w-xs text-sm text-slate">
            {hasReviews ? "Reviews are only accepted from customers with a delivered order." : "Thoughtful service for teams, schools and growing businesses across Ghana."}
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {hasReviews
            ? reviews.map((review) => (
                <figure key={review.id} className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-[transform,box-shadow] duration-300 hover:shadow-lg motion-safe:hover:-translate-y-1 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-ochre/10 text-ochre"><Quote className="size-5" aria-hidden /></span>
                    <Stars rating={review.rating} />
                  </div>
                  {review.title ? <p className="mt-5 font-semibold text-ink">{review.title}</p> : null}
                  <blockquote className="mt-2 line-clamp-6 flex-1 text-base leading-7 text-ink">“{review.body}”</blockquote>
                  <figcaption className="mt-6 border-t border-border pt-4 text-sm">
                    <p className="flex items-center gap-1.5 font-semibold text-ink">{review.displayName}<BadgeCheck className="size-4 text-paper-green" aria-label="Verified purchase" /></p>
                    <p className="mt-1 text-slate">on <Link href={`/product/${review.productSlug}`} className="underline-offset-2 hover:text-ink hover:underline">{review.productName}</Link></p>
                  </figcaption>
                </figure>
              ))
            : promises.map((item) => (
                <div key={item.title} className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
                  <span className="grid size-10 place-items-center rounded-xl bg-ochre/10 text-ochre"><item.icon className="size-5" aria-hidden /></span>
                  <h3 className="mt-5 text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate">{item.body}</p>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
