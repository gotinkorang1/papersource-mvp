export default function ListDetailLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading saved list" className="motion-safe:animate-pulse space-y-8">
      <div className="space-y-3"><div className="h-9 w-56 rounded bg-border/60" /><div className="h-5 max-w-xl rounded bg-border/40" /></div>
      <section className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">{Array.from({ length: 5 }, (_, index) => <div key={index} className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0"><div className="h-5 w-2/3 rounded bg-border/60" /><div className="h-9 w-20 rounded-lg bg-border/40" /></div>)}</section>
    </main>
  );
}
