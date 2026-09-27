export default function AdminLoginLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading staff sign in" className="flex min-h-screen items-center justify-center bg-cream px-4 py-10 sm:py-16">
      <div className="skeleton-shimmer w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[var(--ps-shadow-md)] sm:p-8">
        <div className="skeleton-block h-10 w-44 rounded" />
        <div className="skeleton-block mt-7 h-8 w-48 rounded-lg" />
        <div className="mt-4 space-y-2"><div className="skeleton-block h-4 w-full rounded" /><div className="skeleton-block h-4 w-5/6 rounded" /></div>
        <div className="mt-7 space-y-4"><div className="skeleton-block h-12 rounded-xl" /><div className="skeleton-block h-12 rounded-xl" /><div className="skeleton-block h-11 w-36 rounded-xl" /></div>
      </div>
    </main>
  );
}
