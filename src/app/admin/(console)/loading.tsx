export default function AdminLoading() {
  return (
    <main className="mx-auto min-w-0 max-w-7xl" aria-busy="true" aria-label="Loading operations dashboard">
      <div className="h-3 w-28 animate-pulse rounded bg-muted" />
      <div className="mt-3 h-10 w-52 animate-pulse rounded-lg bg-muted" />
      <div className="mt-3 h-5 max-w-xl animate-pulse rounded bg-muted" />
      <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="h-5 w-36 animate-pulse rounded bg-muted" />
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-muted" />)}
        </div>
      </section>
      <div className="mt-8 h-6 w-48 animate-pulse rounded bg-muted" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-xl border border-border bg-surface" />)}
      </div>
    </main>
  );
}
