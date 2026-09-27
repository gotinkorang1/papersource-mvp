export default function BrandsLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading brands" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="skeleton-shimmer space-y-8">
        <div className="skeleton-block h-4 w-24 rounded-full" />
        <section className="space-y-4">
          <div className="skeleton-block h-11 w-56 rounded-lg" />
          <div className="skeleton-block h-5 max-w-2xl rounded" />
        </section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, index) => <div key={index} className="skeleton-block h-32 rounded-2xl border border-border" />)}
        </div>
      </div>
    </main>
  );
}
