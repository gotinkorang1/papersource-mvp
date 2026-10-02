"use client";

import Link from "next/link";
import { useEffect } from "react";
import { captureClientBoundaryError } from "@/lib/observability/client-sentry";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep a correlation marker available without exposing server details in the UI.
    console.error("PaperSource page failed to render", { digest: error.digest });
    captureClientBoundaryError(error, "root", error.digest);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ochre">PaperSource</p>
      <div className="mt-5 w-full rounded-3xl border border-border bg-muted/30 p-7 sm:p-10"><h1 className="font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Something went wrong</h1>
      <p className="mt-4 max-w-lg text-slate">We couldn’t complete that request. Try again, or return to the shop and continue browsing.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="min-h-11 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Try again</button>
        <Link href="/shop" className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Browse shop</Link>
        <Link href="/contact" className="inline-flex min-h-11 items-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Contact us</Link>
      </div>
      </div>
    </main>
  );
}
