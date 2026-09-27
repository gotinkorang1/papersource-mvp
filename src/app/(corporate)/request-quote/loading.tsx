export default function RequestQuoteLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading quote request" className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="skeleton-shimmer space-y-7">
        <section className="rounded-3xl border border-border bg-muted/30 p-6 sm:p-10">
          <div className="skeleton-block h-3 w-32 rounded-full" />
          <div className="skeleton-block mt-4 h-11 w-72 rounded-lg" />
          <div className="mt-5 space-y-3">
            <div className="skeleton-block h-5 max-w-2xl rounded" />
            <div className="skeleton-block h-5 max-w-xl rounded" />
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
          <div className="skeleton-block h-6 w-40 rounded" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, index) => <div key={index} className="skeleton-block h-12 rounded-xl" />)}
          </div>
          <div className="skeleton-block mt-5 h-28 rounded-xl" />
          <div className="skeleton-block mt-5 h-12 w-40 rounded-xl" />
        </section>
      </div>
    </main>
  );
}
