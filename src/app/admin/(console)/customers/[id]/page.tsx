import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCustomer } from "@/features/admin/queries";
import { requireStaffArea } from "@/lib/staff/require";
import { AdminStatusBadge } from "@/components/admin/status-badge";

export const metadata: Metadata = { title: "Customer" };

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireStaffArea("customers", "read");
  const { id } = await params;
  const customer = await getAdminCustomer(actor.role, id);
  if (!customer) notFound();

  return <main className="max-w-5xl"><p className="text-sm tracking-[0.16em] text-slate uppercase"><Link href="/admin/customers" className="underline">Customers</Link></p><h1 className="mt-2 font-heading text-3xl text-ink">{customer.fullName}</h1><p className="mt-2 text-slate">{customer.email}{customer.phone ? ` · ${customer.phone}` : ""}</p><div className="mt-8 grid gap-6 lg:grid-cols-2"><section className="rounded-md border border-border bg-white p-5"><h2 className="font-heading text-xl text-ink">Saved addresses</h2>{customer.addresses.length === 0 ? <p className="mt-3 text-sm text-slate">No saved addresses.</p> : <ul className="mt-3 space-y-3 text-sm">{customer.addresses.map((address) => <li key={address.id} className="border-b border-border pb-3 last:border-0"><p className="font-medium text-ink">{address.fullName} · {address.phone}</p><p className="text-slate">{address.cityTown}, {address.region}{address.areaSuburb ? ` · ${address.areaSuburb}` : ""}</p>{address.ghanapostGps ? <p className="font-mono text-xs text-slate">GPS {address.ghanapostGps}</p> : null}</li>)}</ul>}</section><section className="rounded-md border border-border bg-white p-5"><h2 className="font-heading text-xl text-ink">Recent orders</h2>{customer.orders.length === 0 ? <p className="mt-3 text-sm text-slate">No orders yet.</p> : <ul className="mt-3 space-y-3 text-sm">{customer.orders.map((order) => <li key={order.id} className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0"><Link href={`/admin/orders/${order.id}`} className="font-medium text-ink underline">{order.number}</Link><AdminStatusBadge status={order.status} /></li>)}</ul>}</section></div><section className="mt-6 rounded-md border border-border bg-white p-5"><h2 className="font-heading text-xl text-ink">Recent quotes</h2>{customer.quotes.length === 0 ? <p className="mt-3 text-sm text-slate">No quotes yet.</p> : <ul className="mt-3 grid gap-3 sm:grid-cols-2">{customer.quotes.map((quote) => <li key={quote.id} className="flex items-center justify-between gap-4 border-b border-border pb-3 text-sm"><Link href={`/admin/quotes/${quote.id}`} className="font-medium text-ink underline">{quote.number}</Link><AdminStatusBadge status={quote.status} /></li>)}</ul>}</section></main>;
}
