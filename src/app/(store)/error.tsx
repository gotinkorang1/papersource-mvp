"use client";

import Link from "next/link";

export default function StoreError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ochre">PaperSource</p>
      <h1 className="mt-4 font-heading text-3xl text-ink sm:text-4xl">We couldn’t load this page</h1>
      <p className="mt-4 max-w-lg text-slate">Something went wrong while loading this section. Try again, or continue browsing the catalogue.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="min-h-11 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Try again</button>
        <Link href="/shop" className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Browse shop</Link>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Go home</Link>
      </div>
    </main>
  );
}
