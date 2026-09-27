export default function FaqLoading() {
  return (
    <main
      role="status"
      aria-busy="true"
      aria-label="Loading frequently asked questions"
      className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 md:py-16 lg:px-8"
    >
      <div className="skeleton-shimmer space-y-8">
        <section className="space-y-4">
          <div className="skeleton-block h-4 w-20 rounded-full" />
          <div className="skeleton-block h-12 w-3/4 max-w-2xl rounded-lg" />
          <div className="skeleton-block h-5 max-w-2xl rounded" />
        </section>
        <section className="divide-y divide-border rounded-2xl border border-border bg-card px-5 shadow-sm sm:px-8">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex items-center justify-between gap-4 py-6">
              <div className="skeleton-block h-5 w-4/5 rounded" />
              <div className="skeleton-block h-6 w-6 shrink-0 rounded-full" />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
