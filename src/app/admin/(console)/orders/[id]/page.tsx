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

  const address = order.addressSnapshot as { fullName?: string; phone?: string; cityTown?: string; region?: string; areaSuburb?: string; ghanapostGps?: string };
  const statusSteps = ["pending_payment", "awaiting_terms", "paid", "processing", "out_for_delivery", "delivered"];
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <main className="max-w-5xl">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">
        <Link href="/admin/orders" className="underline">
          Orders
        </Link>
      </p>
      <h1 className="mt-2 font-heading text-3xl text-ink">{order.number}</h1>
      <p className="mt-2 text-sm text-slate">
        Source {order.source} · {order.status.replaceAll("_", " ")}
      </p>
      <section className="mt-8 rounded-md border border-border bg-white p-5"><h2 className="font-heading text-xl text-ink">Order timeline</h2><ol className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{statusSteps.map((step, index) => <li key={step} className={`rounded-md border px-3 py-2 text-xs capitalize ${index <= currentStep ? "border-paper-green/40 bg-paper-green/10 text-paper-green" : "border-border text-slate"}`}><span className="font-semibold">{index + 1}</span><span className="ml-2">{step.replaceAll("_", " ")}</span></li>)}</ol></section>
      <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-md border border-border bg-white p-5"><h2 className="font-heading text-xl text-ink">Delivery</h2><p className="mt-3 text-sm text-ink">{address.fullName ?? "—"} · {address.phone ?? "—"}</p><p className="mt-1 text-sm text-slate">{[address.areaSuburb, address.cityTown, address.region].filter(Boolean).join(", ") || "Address snapshot unavailable"}</p>{address.ghanapostGps ? <p className="mt-1 font-mono text-xs text-slate">GPS {address.ghanapostGps}</p> : null}<p className="mt-3 text-sm text-slate">Delivery fee: {formatGhs(order.deliveryFee)} · {order.deliveryFeeStatus.replaceAll("_", " ")}</p></section><section className="rounded-md border border-border bg-white p-5"><h2 className="font-heading text-xl text-ink">Payments</h2>{order.payments.length === 0 ? <p className="mt-3 text-sm text-slate">No payment record yet.</p> : <ul className="mt-3 space-y-3 text-sm">{order.payments.map((payment) => <li key={payment.id} className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0"><span className="capitalize text-ink">{payment.provider.replaceAll("_", " ")} · {payment.status}</span><span className="tabular-nums text-slate">{formatGhs(payment.amount)}</span></li>)}</ul>}</section></div>
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
