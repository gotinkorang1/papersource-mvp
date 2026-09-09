export function PageSkeleton({ variant = "content" }: { variant?: "content" | "catalogue" }) {
  return (
    <main aria-busy="true" aria-label="Loading page" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <div className="animate-pulse space-y-5 motion-reduce:animate-none">
        <div className="h-3 w-24 rounded-full bg-muted" />
        <div className="h-10 max-w-xl rounded-lg bg-muted md:h-14" />
        <div className="h-5 max-w-2xl rounded-lg bg-muted" />
        {variant === "catalogue" ? (
          <>
            <div className="mt-10 h-28 rounded-2xl border border-border bg-card" />
            <div className="grid grid-cols-2 gap-4 pt-4 md:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => <div key={index} className="h-64 rounded-xl border border-border bg-card" />)}
            </div>
          </>
        ) : (
          <div className="grid gap-4 pt-8 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-32 rounded-xl border border-border bg-card" />)}
          </div>
        )}
      </div>
    </main>
  );
}
