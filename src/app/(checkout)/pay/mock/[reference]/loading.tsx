export default function PaymentLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading payment" className="mx-auto max-w-3xl px-4 py-16">
      <div className="skeleton-shimmer space-y-5">
        <div className="skeleton-block h-3 w-36 rounded-full" />
        <div className="skeleton-block h-10 w-56 rounded-lg" />
        <div className="skeleton-block h-5 max-w-2xl rounded" />
        <div className="skeleton-block mt-8 h-12 w-48 rounded-xl" />
        <div className="flex gap-3"><div className="skeleton-block h-11 w-28 rounded-xl" /><div className="skeleton-block h-11 w-40 rounded-xl" /></div>
      </div>
    </main>
  );
}
