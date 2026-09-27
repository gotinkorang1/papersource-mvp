export function LegalPageSkeleton() {
  return (
    <main
      role="status"
      aria-busy="true"
      aria-label="Loading policy page"
      className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 md:py-20 lg:px-8"
    >
      <div className="skeleton-shimmer space-y-10">
        <section className="space-y-4">
          <div className="skeleton-block h-4 w-20 rounded-full" />
          <div className="skeleton-block h-12 w-3/4 max-w-xl rounded-lg" />
          <div className="skeleton-block h-4 w-40 rounded" />
        </section>
        <section className="space-y-8">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="space-y-3">
              <div className="skeleton-block h-7 w-2/5 rounded" />
              <div className="space-y-2">
                <div className="skeleton-block h-4 w-full rounded" />
                <div className="skeleton-block h-4 w-11/12 rounded" />
                <div className="skeleton-block h-4 w-4/5 rounded" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
