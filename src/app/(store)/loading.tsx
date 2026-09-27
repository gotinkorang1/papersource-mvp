export default function StoreLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading PaperSource" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div aria-hidden="true" className="skeleton-shimmer space-y-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-5">
            <div className="skeleton-block h-4 w-32 rounded-full" />
            <div className="skeleton-block h-14 w-full max-w-xl rounded-lg md:h-20" />
            <div className="space-y-3"><div className="skeleton-block h-5 max-w-2xl rounded" /><div className="skeleton-block h-5 max-w-xl rounded" /></div>
            <div className="flex flex-wrap gap-3 pt-2"><div className="skeleton-block h-12 w-36 rounded-xl" /><div className="skeleton-block h-12 w-32 rounded-xl" /></div>
          </section>
          <div className="skeleton-block aspect-[4/3] rounded-3xl border border-border" />
        </div>
        <section className="grid gap-4 sm:grid-cols-3"><div className="skeleton-block h-28 rounded-2xl border border-border" /><div className="skeleton-block h-28 rounded-2xl border border-border" /><div className="skeleton-block h-28 rounded-2xl border border-border" /></section>
        <section className="space-y-4"><div className="skeleton-block h-8 w-56 rounded-lg" /><div className="grid grid-cols-2 gap-4 md:grid-cols-4"><div className="skeleton-block h-40 rounded-2xl" /><div className="skeleton-block h-40 rounded-2xl" /><div className="skeleton-block h-40 rounded-2xl" /><div className="skeleton-block h-40 rounded-2xl" /></div></section>
      </div>
    </main>
  );
}
