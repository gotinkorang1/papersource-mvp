import { formatGhs } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { QuoteStatus } from "@/types/catalogue";

const statusClass: Partial<Record<QuoteStatus, string>> = {
  sent: "text-paper-green",
  paid: "text-paper-green",
  order_created: "text-paper-green",
  declined: "text-error",
  expired: "text-error",
  cancelled: "text-error",
  priced: "text-ochre",
  submitted: "text-ochre",
  payment_pending: "text-ochre",
};

export function QuoteSummary({
  number,
  status,
  grandTotalPesewas,
  expiresAt,
}: {
  number: string;
  status: QuoteStatus;
  grandTotalPesewas: number | null;
  expiresAt?: string;
}) {
  return (
    <div className="border border-border bg-card p-5">
      <p className="font-mono text-sm text-slate">{number}</p>
      <p className={cn("mt-1 text-sm font-medium capitalize", statusClass[status] ?? "text-ink")}>
        {status.replaceAll("_", " ")}
      </p>
      {grandTotalPesewas !== null ? (
        <p className="mt-3 text-2xl text-ink tabular-nums">
          {formatGhs(grandTotalPesewas)}
        </p>
      ) : (
        <p className="mt-3 text-slate">Awaiting PaperSource pricing</p>
      )}
      {expiresAt ? (
        <p className="mt-2 text-sm text-slate">Expires {expiresAt}</p>
      ) : null}
    </div>
  );
}
