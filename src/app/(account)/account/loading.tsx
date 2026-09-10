export default function AccountLoading() {
  return (
    <main aria-busy="true" aria-label="Loading your account" className="animate-pulse space-y-8">
      <div className="flex gap-2 overflow-hidden" aria-hidden="true">
        {["w-24", "w-20", "w-20", "w-24", "w-28"].map((width) => (
          <div key={width} className={`h-10 shrink-0 rounded-full bg-border/60 ${width}`} />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-9 w-40 rounded bg-border/60" />
        <div className="h-5 max-w-xl rounded bg-border/40" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-24 rounded-xl border border-border bg-surface" />
        <div className="h-24 rounded-xl border border-border bg-surface" />
      </div>
      <div className="h-48 rounded-xl border border-border bg-surface" />
    </main>
  );
}
