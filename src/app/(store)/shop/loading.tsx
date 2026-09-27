export default function ShopLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading shop" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="skeleton-shimmer space-y-8">
        <div className="skeleton-block h-4 w-24 rounded-full" />
        <section className="space-y-4">
          <div className="skeleton-block h-12 w-2/3 max-w-xl rounded-lg" />
          <div className="skeleton-block h-5 max-w-2xl rounded" />
          <div className="skeleton-block h-5 max-w-xl rounded" />
        </section>
        <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="skeleton-block h-12 flex-1 rounded-xl" />
            <div className="skeleton-block h-12 w-full rounded-xl sm:w-36" />
            <div className="skeleton-block h-12 w-full rounded-xl sm:w-36" />
          </div>
        </section>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="skeleton-block h-64 rounded-xl border border-border" />)}
        </div>
      </div>
    </main>
  );
}
