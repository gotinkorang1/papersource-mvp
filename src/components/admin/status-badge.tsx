const toneByStatus: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  successful: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  processing: "bg-amber-50 text-amber-700 ring-amber-200",
  awaiting_payment: "bg-amber-50 text-amber-700 ring-amber-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function AdminStatusBadge({ status }: { status: string }) {
  const label = status.replaceAll("_", " ");
  const tone = toneByStatus[status] ?? "bg-sky-50 text-sky-700 ring-sky-200";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${tone}`}>{label}</span>;
}
