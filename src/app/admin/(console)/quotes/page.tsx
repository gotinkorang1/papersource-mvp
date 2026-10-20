import type { Metadata } from "next";
import Link from "next/link";
import { listSubmittedQuotes } from "@/features/quotations/admin";
import { formatGhs } from "@/lib/money";
import { requireStaffArea } from "@/lib/staff/require";
import { AdminStatusBadge } from "@/components/admin/status-badge";
import { AdminPagination } from "@/components/admin/admin-pagination";

export const metadata: Metadata = {
  title: "Quotes",
};

const statusFilters = [
  ["", "All"],
  ["submitted", "Submitted"],
  ["under_review", "Under review"],
  ["priced", "Priced"],
  ["sent", "Sent"],
  ["accepted", "Accepted"],
] as const;

export default async function AdminQuotesPage({ searchParams }: { searchParams: Promise<{ page?: string; status?: string }> }) {
  const actor = await requireStaffArea("quotes", "read");
  const filters = await searchParams;
  const quoteResult = await listSubmittedQuotes(actor.role, filters.page, filters.status);
  const rows = quoteResult.rows;
  const activeStatus = quoteResult.status ?? "";

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Commerce</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Quotes</h1>
      <p className="mt-3 text-slate">
        RFQs are business objects. Price and send from this queue — not from SQL.
      </p>
      <nav aria-label="Filter quotes by status" className="mt-6 flex flex-wrap gap-2">
        {statusFilters.map(([value, label]) => (
          <Link
            key={value || "all"}
            href={value ? `/admin/quotes?status=${value}` : "/admin/quotes"}
            aria-current={activeStatus === value ? "page" : undefined}
            className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition ${activeStatus === value ? "border-ink bg-ink text-paper" : "border-border bg-card text-ink hover:border-ink"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className="mt-8 text-slate">{activeStatus ? "No quotations with this status." : "No submitted quotations yet."}</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="admin-responsive-table w-full min-w-[38rem] text-sm">
            <caption className="sr-only">Submitted quotations</caption>
            <thead>
              <tr className="border-b border-border text-left text-slate">
                <th scope="col" className="px-4 py-3 font-medium">Number</th>
                <th scope="col" className="px-4 py-3 font-medium">Organisation</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3" data-label="Number">
                    <Link href={`/admin/quotes/${row.id}`} className="underline">
                      {row.number ?? "Unnumbered"}
                    </Link>
                  </td>
                  <td className="px-4 py-3" data-label="Organisation">{row.organizationName ?? "—"}</td>
                  <td className="px-4 py-3" data-label="Status"><AdminStatusBadge status={row.status} /></td>
                  <td className="px-4 py-3 tabular-nums" data-label="Total">{formatGhs(row.grandTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AdminPagination pathname="/admin/quotes" params={{ status: quoteResult.status }} page={quoteResult.page} hasNext={quoteResult.hasNext} />
    </main>
  );
}
