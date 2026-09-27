export default function BrandLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading brand catalogue" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="skeleton-shimmer space-y-8">
        <div className="skeleton-block h-4 w-36 rounded-full" />
        <section className="space-y-4 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="skeleton-block h-10 w-2/3 rounded-lg" />
          <div className="skeleton-block h-5 max-w-2xl rounded" />
          <div className="skeleton-block h-5 max-w-xl rounded" />
        </section>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="skeleton-block h-64 rounded-xl border border-border" />)}
        </div>
      </div>
    </main>
  );
}
