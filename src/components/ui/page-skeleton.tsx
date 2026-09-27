export function PageSkeleton({ variant = "content" }: { variant?: "content" | "catalogue" | "checkout" }) {
  const label = variant === "catalogue" ? "Loading catalogue" : variant === "checkout" ? "Loading checkout" : "Loading page";

  return (
    <main role="status" aria-busy="true" aria-label={label} className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <div className="skeleton-shimmer space-y-5">
        <div className="skeleton-block h-3 w-24 rounded-full" />
        <div className="skeleton-block h-10 max-w-xl rounded-lg md:h-14" />
        <div className="skeleton-block h-5 max-w-2xl rounded-lg" />
        {variant === "catalogue" ? (
          <>
            <div className="skeleton-block mt-10 h-28 rounded-2xl border border-border" />
            <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => <div key={index} className="skeleton-block h-64 rounded-xl border border-border" />)}
            </div>
          </>
        ) : variant === "checkout" ? (
          <div className="grid gap-6 pt-8 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="skeleton-block h-6 w-40 rounded" />
              {Array.from({ length: 4 }, (_, index) => <div key={index} className="skeleton-block h-16 rounded-xl" />)}
            </section>
            <aside className="h-56 rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="skeleton-block h-6 w-32 rounded" />
              <div className="mt-5 space-y-3">
                <div className="skeleton-block h-4 w-full rounded" />
                <div className="skeleton-block h-4 w-4/5 rounded" />
                <div className="skeleton-block mt-6 h-11 w-full rounded-lg" />
              </div>
            </aside>
          </div>
        ) : (
          <div className="grid gap-4 pt-8 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => <div key={index} className="skeleton-block h-32 rounded-xl border border-border" />)}
          </div>
        )}
      </div>
    </main>
  );
}
