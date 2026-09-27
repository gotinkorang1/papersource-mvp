export default function SearchLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading search results" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="skeleton-shimmer space-y-7">
        <div className="skeleton-block h-4 w-28 rounded-full" />
        <div className="skeleton-block h-11 w-64 rounded-lg" />
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="skeleton-block h-12 flex-1 rounded-xl" />
          <div className="skeleton-block h-12 w-full rounded-xl sm:w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[15rem_1fr]">
          <aside className="hidden rounded-2xl border border-border bg-card p-4 lg:block">
            <div className="skeleton-block h-5 w-24 rounded" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 5 }, (_, index) => <div key={index} className="skeleton-block h-9 rounded-lg" />)}
            </div>
          </aside>
          <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {Array.from({ length: 9 }, (_, index) => <div key={index} className="skeleton-block h-64 rounded-xl border border-border" />)}
          </section>
        </div>
      </div>
    </main>
  );
}
