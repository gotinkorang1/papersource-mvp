import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ochre">PaperSource</p>
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.14em] text-slate">404 · Page not found</p>
      <div className="mt-5 w-full rounded-3xl border border-border bg-muted/30 p-7 sm:p-10"><h1 className="font-heading text-3xl font-semibold tracking-tight text-ink sm:text-4xl">That page has moved</h1>
      <p className="mt-4 max-w-lg text-slate">
        The link may be outdated or the item is no longer available. Browse the catalogue or return to the homepage to continue.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="inline-flex min-h-11 items-center rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          Browse shop
        </Link>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          Go to homepage
        </Link>
        <Link href="/contact" className="inline-flex min-h-11 items-center rounded-lg px-4 py-2.5 text-sm font-medium text-slate underline underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          Contact us
        </Link>
      </div>
      </div>
    </main>
  );
}
