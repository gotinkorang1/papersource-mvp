export default function ListsLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading saved lists" className="motion-safe:animate-pulse space-y-8">
      <div className="space-y-3"><div className="h-9 w-44 rounded bg-border/60" /><div className="h-5 max-w-xl rounded bg-border/40" /></div>
      <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 6 }, (_, index) => <section key={index} className="h-32 rounded-2xl border border-border bg-card p-5"><div className="h-5 w-3/5 rounded bg-border/60" /><div className="mt-4 h-4 w-2/5 rounded bg-border/40" /></section>)}</div>
    </main>
  );
}
