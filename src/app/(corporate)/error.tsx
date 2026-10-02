"use client";

import Link from "next/link";
import { useEffect } from "react";
import { captureClientBoundaryError } from "@/lib/observability/client-sentry";

export default function CorporateError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("PaperSource business area failed to render", { digest: error.digest });
    captureClientBoundaryError(error, "corporate", error.digest);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <section role="alert" className="w-full rounded-3xl border border-border bg-card p-7 text-center shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ochre">Business services</p>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">We couldn&apos;t load this request</h1>
        <p className="mx-auto mt-4 max-w-lg text-slate">Your quote and enquiry information is safe. Try again, or return to the business services page.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="min-h-11 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Try again</button>
          <Link href="/business" className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Back to business services</Link>
        </div>
      </section>
    </main>
  );
}
