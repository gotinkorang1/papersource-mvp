import type { Metadata } from "next";
import Link from "next/link";
import { count, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { orders, profiles, quotes, productReviews } from "@/lib/db/schema";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminDashboardPage() {
  const actor = await requireStaffArea("dashboard", "read");
  const db = getDb();
  const canReadQuotes = canAccessAdmin(actor.role, "quotes", "read");
  const canReadOrders = canAccessAdmin(actor.role, "orders", "read");
  const canReadReviews = canAccessAdmin(actor.role, "reviews", "read");

  const openQuotes = canReadQuotes
    ? await db
        .select({ status: quotes.status, total: count() })
        .from(quotes)
        .where(
          inArray(quotes.status, ["submitted", "under_review", "priced", "sent"]),
        )
        .groupBy(quotes.status)
    : [];

  const [pendingPay] = canReadOrders
    ? await db
        .select({ total: count() })
        .from(orders)
        .where(eq(orders.status, "pending_payment"))
    : [{ total: 0 }];

  const [nationwide] = canReadOrders
    ? await db
        .select({ total: count() })
        .from(orders)
        .where(eq(orders.status, "awaiting_terms"))
    : [{ total: 0 }];

  const [pendingReviews] = canReadReviews
    ? await db.select({ total: count() }).from(productReviews).where(eq(productReviews.status, "pending"))
    : [{ total: 0 }];
  const recentOrders = canReadOrders
    ? await db
        .select({ id: orders.id, number: orders.number, status: orders.status, customerEmail: profiles.email, updatedAt: orders.updatedAt })
        .from(orders)
        .leftJoin(profiles, eq(profiles.id, orders.profileId))
        .orderBy(desc(orders.updatedAt))
        .limit(6)
    : [];

  return (
    <main className="min-w-0">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Operations</p>
      <h1 className="mt-2 font-heading text-3xl leading-tight text-ink sm:text-4xl">Dashboard</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate sm:text-base">
        Quote queue, unpaid orders, and catalogue desks. Do not operate this
        business from Supabase Studio.
      </p>
      <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
        {canReadQuotes ? openQuotes.map((row) => (
          <Link
            key={row.status}
            href="/admin/quotes"
            className="group min-h-28 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <p className="text-xs tracking-[0.14em] text-slate uppercase">
              {row.status.replaceAll("_", " ")}
            </p>
            <p className="mt-2 font-heading text-3xl tabular-nums text-ink">
              {row.total}
            </p>
          </Link>
        )) : null}
        {canReadOrders ? <Link
          href="/admin/orders"
          className="group min-h-28 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <p className="text-xs tracking-[0.14em] text-slate uppercase">
            Awaiting Paystack
          </p>
          <p className="mt-2 font-heading text-3xl tabular-nums text-ink">
            {pendingPay?.total ?? 0}
          </p>
        </Link> : null}
        {canReadOrders ? <Link
          href="/admin/orders"
          className="group min-h-28 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <p className="text-xs tracking-[0.14em] text-slate uppercase">
            Nationwide arranging
          </p>
          <p className="mt-2 font-heading text-3xl tabular-nums text-ink">
            {nationwide?.total ?? 0}
          </p>
        </Link> : null}
        {canReadReviews ? <Link href="/admin/reviews" className="group min-h-28 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"><p className="text-xs tracking-[0.14em] text-slate uppercase">Pending reviews</p><p className="mt-2 font-heading text-3xl tabular-nums text-ink">{pendingReviews?.total ?? 0}</p><p className="mt-1 text-xs text-slate">Moderation queue</p></Link> : null}
      </div>
      {canReadOrders ? <section className="mt-8 rounded-xl border border-border bg-surface p-5 sm:p-6" aria-labelledby="recent-orders-heading"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs tracking-[0.14em] text-slate uppercase">Live queue</p><h2 id="recent-orders-heading" className="mt-1 font-heading text-xl text-ink">Recently updated orders</h2></div><Link href="/admin/orders" className="text-sm font-medium text-ink underline underline-offset-4">View all</Link></div>{recentOrders.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[38rem] text-sm"><thead><tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-slate"><th className="px-2 py-3 font-medium">Order</th><th className="px-2 py-3 font-medium">Customer</th><th className="px-2 py-3 font-medium">Status</th><th className="px-2 py-3 font-medium">Updated</th></tr></thead><tbody>{recentOrders.map((order) => <tr key={order.id} className="border-b border-border last:border-0"><td className="px-2 py-3 font-medium text-ink"><Link href={`/admin/orders/${order.id}`} className="underline underline-offset-4">{order.number ?? "Draft order"}</Link></td><td className="px-2 py-3 text-slate">{order.customerEmail ?? "Guest checkout"}</td><td className="px-2 py-3 capitalize text-slate">{order.status.replaceAll("_", " ")}</td><td className="px-2 py-3 text-slate">{new Date(order.updatedAt).toLocaleDateString("en-GH")}</td></tr>)}</tbody></table></div> : <p className="mt-5 text-sm text-slate">No orders have been updated yet.</p>}</section> : null}
    </main>
  );
}
