export default function ContactLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading contact page" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="skeleton-shimmer space-y-8">
        <section className="space-y-4"><div className="skeleton-block h-4 w-28 rounded-full" /><div className="skeleton-block h-12 w-3/4 max-w-xl rounded-lg" /><div className="skeleton-block h-5 max-w-2xl rounded" /></section>
        <div className="grid gap-4 md:grid-cols-3"><div className="skeleton-block h-32 rounded-2xl border border-border" /><div className="skeleton-block h-32 rounded-2xl border border-border" /><div className="skeleton-block h-32 rounded-2xl border border-border" /></div>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]"><section className="space-y-4 rounded-2xl border border-border bg-card p-6"><div className="skeleton-block h-7 w-40 rounded" /><div className="skeleton-block h-5 w-full rounded" /><div className="skeleton-block h-5 w-4/5 rounded" /><div className="skeleton-block mt-5 h-11 w-40 rounded-xl" /></section><div className="skeleton-block min-h-64 rounded-2xl border border-border" /></div>
      </div>
    </main>
  );
}
