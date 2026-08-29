import type { Metadata } from "next";
import Link from "next/link";
import { listSubmittedQuotes } from "@/features/quotations/admin";
import { formatGhs } from "@/lib/money";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Quotes",
};

export default async function AdminQuotesPage() {
  const actor = await requireStaffArea("quotes", "read");
  const rows = await listSubmittedQuotes(actor.role);

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Commerce</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Quotes</h1>
      <p className="mt-3 text-slate">
        RFQs are business objects. Price and send from this queue — not from SQL.
      </p>
      {rows.length === 0 ? (
        <p className="mt-8 text-slate">No submitted quotations yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-md border border-border bg-white">
          <table className="w-full text-sm">
            <caption className="sr-only">Submitted quotations</caption>
            <thead>
              <tr className="border-b border-border text-left text-slate">
                <th className="px-4 py-3 font-medium">Number</th>
                <th className="px-4 py-3 font-medium">Organisation</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/quotes/${row.id}`} className="underline">
                      {row.number ?? "Unnumbered"}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{row.organizationName ?? "—"}</td>
                  <td className="px-4 py-3">{row.status.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3 tabular-nums">{formatGhs(row.grandTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
