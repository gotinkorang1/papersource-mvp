export default function ProductLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading product" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="skeleton-shimmer space-y-8">
        <div className="skeleton-block h-4 w-48 rounded-full" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
          <section className="space-y-4">
            <div className="skeleton-block aspect-square rounded-2xl border border-border" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }, (_, index) => <div key={index} className="skeleton-block aspect-square rounded-xl border border-border" />)}
            </div>
          </section>
          <section className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-7">
            <div className="skeleton-block h-4 w-28 rounded" />
            <div className="skeleton-block h-10 w-4/5 rounded-lg" />
            <div className="skeleton-block h-6 w-32 rounded" />
            <div className="space-y-3 pt-3">
              <div className="skeleton-block h-4 w-full rounded" />
              <div className="skeleton-block h-4 w-11/12 rounded" />
              <div className="skeleton-block h-4 w-3/4 rounded" />
            </div>
            <div className="skeleton-block mt-6 h-12 w-full rounded-xl" />
          </section>
        </div>
      </div>
    </main>
  );
}
