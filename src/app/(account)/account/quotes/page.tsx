import type { Metadata } from "next";
import Link from "next/link";
import { listCustomerQuotes } from "@/features/account/history";
import { formatGhs } from "@/lib/money";
import { requireCustomer } from "@/lib/customer/require";

export const metadata: Metadata = {
  title: "Quotes",
  robots: { index: false, follow: false },
};

export default async function AccountQuotesPage() {
  const actor = await requireCustomer("/account/quotes");
  const rows = await listCustomerQuotes(actor.profileId);

  return (
    <main>
      <h1 className="text-3xl text-ink">Quotes</h1>
      <p className="mt-3 text-slate">Review submitted quotations and continue a draft without losing your separate quote basket.</p>
      {rows.length === 0 ? (
        <p className="mt-6 text-slate">
          No quotations yet.{" "}
          <Link href="/quick-order" className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
            Quick Order
          </Link>
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <table className="account-history-table w-full min-w-[30rem] text-sm">
            <caption className="sr-only">Your quotations</caption>
            <thead>
              <tr className="border-b border-border text-left text-slate">
                <th className="px-4 py-3 font-medium">Number</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0 hover:bg-cream/40 dark:hover:bg-ink/20">
                  <td className="px-4 py-3" data-label="Number">
                    <Link href={row.status === "draft" ? "/quote" : row.accessToken ? `/quote/${row.accessToken}` : "/account/quotes"} className="inline-flex min-h-11 items-center underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                      {row.number ?? "Draft quote"}
                    </Link>
                  </td>
                  <td className="px-4 py-3" data-label="Status"><span className="inline-flex rounded-full border border-border px-2.5 py-1 text-xs font-medium capitalize text-ink">{row.status.replaceAll("_", " ")}</span></td>
                  <td className="px-4 py-3 tabular-nums" data-label="Total">{formatGhs(row.grandTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
