export default function CategoryLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading category" className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="skeleton-shimmer space-y-8">
        <div className="skeleton-block h-4 w-36 rounded-full" />
        <div className="grid items-center gap-6 md:grid-cols-[1fr_16rem]">
          <div className="space-y-4">
            <div className="skeleton-block h-11 w-3/5 rounded-lg" />
            <div className="skeleton-block h-5 max-w-2xl rounded" />
            <div className="skeleton-block h-5 max-w-xl rounded" />
          </div>
          <div className="skeleton-block aspect-[4/3] rounded-xl border border-border" />
        </div>
        <div className="skeleton-block h-20 rounded-2xl border border-border" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="skeleton-block h-32 rounded-xl border border-border sm:h-64" />)}
        </div>
      </div>
    </main>
  );
}
