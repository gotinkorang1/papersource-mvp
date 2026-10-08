"use client";

import { useEffect } from "react";
import { captureClientBoundaryError } from "@/lib/observability/client-sentry";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("PaperSource root layout failed to render", { digest: error.digest });
    captureClientBoundaryError(error, "global", error.digest);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ochre">PaperSource</p>
          <h1 className="mt-4 text-3xl font-semibold">We need to reload PaperSource</h1>
          <p className="mt-4 text-slate">The page shell did not load correctly. Your account and order data are unchanged.</p>
          <button type="button" onClick={reset} className="mt-8 min-h-11 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
