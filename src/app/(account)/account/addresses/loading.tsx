export default function AccountAddressesLoading() {
  return (
    <main role="status" aria-busy="true" aria-label="Loading saved addresses" className="motion-safe:animate-pulse space-y-8">
      <div className="space-y-3"><div className="h-9 w-52 rounded bg-border/60" /><div className="h-5 max-w-xl rounded bg-border/40" /></div>
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="h-6 w-36 rounded bg-border/60" /><div className="mt-5 grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-28 rounded-xl border border-border bg-surface" />)}</div></section>
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="h-6 w-40 rounded bg-border/60" /><div className="mt-5 grid gap-4 sm:grid-cols-2">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-11 rounded-lg bg-border/40" />)}</div></section>
    </main>
  );
}
