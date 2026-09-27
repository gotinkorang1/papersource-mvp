export default function AboutLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading About PaperSource" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="skeleton-shimmer space-y-10">
        <section className="space-y-4 rounded-3xl border border-border bg-card p-6 sm:p-10">
          <div className="skeleton-block h-4 w-28 rounded-full" />
          <div className="skeleton-block h-12 w-3/4 rounded-lg" />
          <div className="space-y-3"><div className="skeleton-block h-5 max-w-2xl rounded" /><div className="skeleton-block h-5 max-w-xl rounded" /></div>
        </section>
        <section className="grid gap-4 sm:grid-cols-3"><div className="skeleton-block h-36 rounded-2xl border border-border" /><div className="skeleton-block h-36 rounded-2xl border border-border" /><div className="skeleton-block h-36 rounded-2xl border border-border" /></section>
        <section className="space-y-4"><div className="skeleton-block h-8 w-52 rounded-lg" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="skeleton-block h-48 rounded-2xl border border-border" />)}</div></section>
      </div>
    </main>
  );
}
