export default function OrganisationLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading organisation" className="motion-safe:animate-pulse space-y-8">
      <div className="space-y-3"><div className="h-9 w-56 rounded bg-border/60" /><div className="h-5 max-w-xl rounded bg-border/40" /></div>
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-11 rounded-lg bg-border/40" />)}<div className="h-11 w-40 rounded-lg bg-border/60" /></section>
    </main>
  );
}
