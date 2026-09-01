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
      {rows.length === 0 ? (
        <p className="mt-6 text-slate">
          No quotations yet.{" "}
          <Link href="/quick-order" className="underline">
            Quick Order
          </Link>
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-md border border-border bg-white">
          <table className="w-full text-sm">
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
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link href={row.status === "draft" ? "/quote" : `/quote/${row.id}`} className="underline">
                      {row.number ?? "Draft quote"}
                    </Link>
                  </td>
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
