"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep the browser console useful without exposing server details in the UI.
    console.error("Admin workspace failed to render", { digest: error.digest });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[50svh] max-w-xl items-center justify-center py-12">
      <section className="w-full rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-8" role="alert">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ochre">Operations desk</p>
        <h1 className="mt-3 font-heading text-2xl text-ink sm:text-3xl">This workspace needs a retry</h1>
        <p className="mt-3 text-sm leading-6 text-slate">We couldn&apos;t load this admin view. Your data is unchanged. Try again, or return to the dashboard.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="min-h-11 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Try again</button>
          <Link href="/admin" className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-ink transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Back to dashboard</Link>
        </div>
      </section>
    </main>
  );
}
