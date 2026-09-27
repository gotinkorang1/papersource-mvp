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
        <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="skeleton-block h-6 w-40 rounded" />
            <div className="flex gap-2"><div className="skeleton-block h-10 w-36 rounded-lg" /><div className="skeleton-block h-10 w-24 rounded-lg" /></div>
          </div>
          <div className="mt-5 space-y-3">
            {Array.from({ length: 6 }, (_, index) => <div key={index} className="flex items-center gap-3 border-b border-border py-3 last:border-0"><div className="skeleton-block size-8 rounded" /><div className="skeleton-block h-4 flex-1 rounded" /><div className="skeleton-block h-4 w-20 rounded" /><div className="skeleton-block h-8 w-16 rounded-lg" /></div>)}
          </div>
        </section>
      </div>
    </main>
  );
}
