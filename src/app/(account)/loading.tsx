export default function AccountEntryLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading account page" className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <div className="skeleton-shimmer rounded-3xl border border-border bg-muted/30 p-6 sm:p-9">
        <div className="skeleton-block h-3 w-40 rounded-full" />
        <div className="skeleton-block mt-4 h-11 w-48 rounded-lg" />
        <div className="mt-5 space-y-3">
          <div className="skeleton-block h-4 w-full rounded" />
          <div className="skeleton-block h-4 w-11/12 rounded" />
          <div className="skeleton-block h-4 w-4/5 rounded" />
        </div>
        <div className="mt-8 space-y-4">
          <div className="skeleton-block h-12 rounded-xl" />
          <div className="skeleton-block h-12 rounded-xl" />
          <div className="skeleton-block h-12 rounded-xl" />
        </div>
        <div className="skeleton-block mt-6 h-4 w-56 rounded" />
      </div>
    </main>
  );
}
