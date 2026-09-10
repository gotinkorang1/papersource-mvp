"use client";

import Link from "next/link";

export default function AccountError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main role="alert" className="rounded-2xl border border-error/30 bg-surface p-6 shadow-sm sm:p-8">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-error">Account temporarily unavailable</p>
      <h1 className="mt-3 font-heading text-2xl text-ink">We couldn’t load your account</h1>
      <p className="mt-3 max-w-lg text-slate">Your session is safe. Please try again, or return to the shop while we reconnect.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="min-h-11 rounded-lg bg-ink px-5 py-2.5 font-medium text-cream transition hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Try again</button>
        <Link href="/shop" className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-2.5 font-medium text-ink transition hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Back to shop</Link>
      </div>
    </main>
  );
}
