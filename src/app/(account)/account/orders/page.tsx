import type { Metadata } from "next";
import Link from "next/link";
import { listCustomerOrders } from "@/features/account/history";
import { formatGhs } from "@/lib/money";
import { requireCustomer } from "@/lib/customer/require";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export default async function AccountOrdersPage() {
  const actor = await requireCustomer("/account/orders");
  const rows = await listCustomerOrders(actor.profileId);

  return (
    <main>
      <h1 className="text-3xl text-ink">Orders</h1>
      <p className="mt-3 text-slate">Track recent purchases and open an order for its full receipt and status history.</p>
      {rows.length === 0 ? (
        <p className="mt-6 text-slate">
          No orders on this account yet.{" "}
          <Link href="/shop" className="underline">
            Shop
          </Link>
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full min-w-[30rem] text-sm">
            <caption className="sr-only">Your orders</caption>
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
                  <td className="px-4 py-3">
                    <Link href={`/order/${row.number}`} className="underline">
                      {row.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><span className="inline-flex rounded-full border border-border px-2.5 py-1 text-xs font-medium capitalize text-ink">{row.status.replaceAll("_", " ")}</span></td>
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
