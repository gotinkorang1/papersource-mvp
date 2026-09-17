export default function AdminLoading() {
  return (
    <main className="mx-auto min-w-0 max-w-7xl" aria-busy="true" aria-label="Loading operations dashboard">
      <div className="skeleton-shimmer space-y-3">
        <div className="skeleton-block h-3 w-28 rounded" />
        <div className="skeleton-block h-10 w-52 rounded-lg" />
        <div className="skeleton-block h-5 max-w-xl rounded" />
        <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="skeleton-block h-5 w-36 rounded" />
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="skeleton-block h-20 rounded-xl" />)}
          </div>
        </section>
        <div className="skeleton-block mt-8 h-6 w-48 rounded" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="skeleton-block h-28 rounded-xl border border-border" />)}
        </div>
      </div>
    </main>
  );
}
