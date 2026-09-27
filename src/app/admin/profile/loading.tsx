export default function AdminProfileLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading staff profile" className="max-w-2xl">
      <div className="skeleton-shimmer space-y-4">
        <div className="skeleton-block h-3 w-20 rounded-full" />
        <div className="skeleton-block h-10 w-56 rounded-lg" />
        <div className="skeleton-block h-5 max-w-xl rounded" />
        <section className="mt-8 space-y-4 rounded-xl border border-border bg-card p-5">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="skeleton-block h-11 rounded-lg" />)}
          <div className="skeleton-block h-11 w-32 rounded-lg" />
        </section>
        <section className="mt-6 space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="skeleton-block h-6 w-44 rounded" />
          <div className="skeleton-block h-11 rounded-lg" />
          <div className="skeleton-block h-11 rounded-lg" />
          <div className="skeleton-block h-11 w-40 rounded-lg" />
        </section>
      </div>
    </main>
  );
}
