export default function OrderLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading order" className="mx-auto max-w-3xl px-4 py-16">
      <div className="skeleton-shimmer space-y-5">
        <div className="skeleton-block h-3 w-24 rounded-full" />
        <div className="skeleton-block h-10 w-64 rounded-lg" />
        <div className="skeleton-block h-5 max-w-2xl rounded" />
        <div className="skeleton-block mt-8 h-28 rounded-2xl border border-border" />
        <div className="skeleton-block h-48 rounded-2xl border border-border" />
      </div>
    </main>
  );
}
