import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrder } from "@/features/orders/queries";
import { formatGhs } from "@/lib/money";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Order",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const actor = await requireStaffArea("orders", "read");
  const { id } = await params;
  const order = await getAdminOrder(actor.role, id);
  if (!order) {
    notFound();
  }

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">
        <Link href="/admin/orders" className="underline">
          Orders
        </Link>
      </p>
      <h1 className="mt-2 font-heading text-3xl text-ink">{order.number}</h1>
      <p className="mt-2 text-sm text-slate">
        Source {order.source} · {order.status.replaceAll("_", " ")}
      </p>
      <table className="mt-8 w-full text-sm">
        <caption className="sr-only">Order lines</caption>
        <thead>
          <tr className="border-b border-border text-left text-slate">
            <th className="py-2 font-medium">Item</th>
            <th className="py-2 font-medium">Qty</th>
            <th className="py-2 font-medium">Line</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((line) => (
            <tr key={line.id} className="border-b border-border">
              <td className="py-3">
                {line.nameSnapshot}{" "}
                <span className="text-slate">{line.skuSnapshot}</span>
              </td>
              <td className="py-3 tabular-nums">{line.quantity}</td>
              <td className="py-3 tabular-nums">{formatGhs(line.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-6 tabular-nums text-ink">Total {formatGhs(order.grandTotal)}</p>
    </main>
  );
}
