"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function CheckoutError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("PaperSource checkout failed to render", { digest: error.digest });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <section role="alert" className="w-full rounded-3xl border border-border bg-card p-7 text-center shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ochre">Checkout</p>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">We couldn&apos;t load checkout</h1>
        <p className="mx-auto mt-4 max-w-lg text-slate">Your basket has not been changed. Try again, or return to your cart to review your items.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="min-h-11 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Try again</button>
          <Link href="/cart" className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Back to cart</Link>
        </div>
      </section>
    </main>
  );
}
