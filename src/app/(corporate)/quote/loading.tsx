export default function QuoteLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading quote list" className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="skeleton-shimmer space-y-7">
        <div className="skeleton-block h-4 w-28 rounded-full" />
        <div className="skeleton-block h-11 w-56 rounded-lg" />
        <div className="skeleton-block h-5 max-w-2xl rounded" />
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="skeleton-block h-5 w-36 rounded" />
          <div className="mt-5 divide-y divide-border">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="flex items-center justify-between gap-4 py-4"><div className="skeleton-block h-5 w-2/3 rounded" /><div className="skeleton-block h-9 w-20 rounded-lg" /></div>)}
          </div>
        </section>
        <div className="flex gap-3"><div className="skeleton-block h-11 w-36 rounded-xl" /><div className="skeleton-block h-11 w-32 rounded-xl" /></div>
      </div>
    </main>
  );
}
