import type { Metadata } from "next";
import Link from "next/link";
import { count, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { orders, profiles, quotes, productReviews } from "@/lib/db/schema";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { requireStaffArea } from "@/lib/staff/require";
import { AdminStatusBadge } from "@/components/admin/status-badge";
import { getCatalogueSeoAudit } from "@/features/catalogue/seo-audit";

export const metadata: Metadata = {
  title: "Admin",
};

const quoteMetricTone: Record<string, string> = {
  submitted: "border-t-ochre",
  under_review: "border-t-ochre",
  priced: "border-t-paper-green",
  sent: "border-t-paper-green",
};
const quoteStatuses = ["submitted", "under_review", "priced", "sent"] as const;

export default async function AdminDashboardPage() {
  const actor = await requireStaffArea("dashboard", "read");
  const db = getDb();
  const canReadQuotes = canAccessAdmin(actor.role, "quotes", "read");
  const canReadOrders = canAccessAdmin(actor.role, "orders", "read");
  const canReadReviews = canAccessAdmin(actor.role, "reviews", "read");
  const quickActions = [
    canAccessAdmin(actor.role, "products", "write")
      ? { label: "Add product", href: "/admin/products/new", hint: "Create a catalogue item" }
      : null,
    canAccessAdmin(actor.role, "quotes", "write")
      ? { label: "Review quotes", href: "/admin/quotes", hint: "Keep the quote queue moving" }
      : null,
    canAccessAdmin(actor.role, "orders", "write")
      ? { label: "Process orders", href: "/admin/orders", hint: "Update fulfilment status" }
      : null,
    canAccessAdmin(actor.role, "inventory", "write")
      ? { label: "Update inventory", href: "/admin/inventory", hint: "Adjust stock levels" }
      : null,
  ].filter((action): action is NonNullable<typeof action> => Boolean(action));

  const [openQuotes, pendingPayRows, nationwideRows, pendingReviewRows, recentOrders, seoAudit] = await Promise.all([
    canReadQuotes
      ? db
          .select({ status: quotes.status, total: count() })
          .from(quotes)
          .where(inArray(quotes.status, ["submitted", "under_review", "priced", "sent"]))
          .groupBy(quotes.status)
      : Promise.resolve([]),
    canReadOrders
      ? db.select({ total: count() }).from(orders).where(eq(orders.status, "pending_payment"))
      : Promise.resolve([{ total: 0 }]),
    canReadOrders
      ? db.select({ total: count() }).from(orders).where(eq(orders.status, "awaiting_terms"))
      : Promise.resolve([{ total: 0 }]),
    canReadReviews
      ? db.select({ total: count() }).from(productReviews).where(eq(productReviews.status, "pending"))
      : Promise.resolve([{ total: 0 }]),
    canReadOrders
      ? db
          .select({ id: orders.id, number: orders.number, status: orders.status, customerEmail: profiles.email, updatedAt: orders.updatedAt })
          .from(orders)
          .leftJoin(profiles, eq(profiles.id, orders.profileId))
          .orderBy(desc(orders.updatedAt))
          .limit(6)
      : Promise.resolve([]),
    canAccessAdmin(actor.role, "products", "read") ? getCatalogueSeoAudit() : Promise.resolve(null),
  ]);
  const pendingPay = pendingPayRows[0];
  const nationwide = nationwideRows[0];
  const pendingReviews = pendingReviewRows[0];
  const quoteCounts = new Map(openQuotes.map((row) => [row.status, row.total]));

  return (
    <main className="mx-auto min-w-0 max-w-7xl">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Operations</p>
      <h1 className="mt-2 font-heading text-3xl leading-tight text-ink sm:text-4xl">Dashboard</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate sm:text-base">
        Quote queue, unpaid orders, and catalogue desks. Do not operate this
        business from Supabase Studio.
      </p>
      {quickActions.length ? (
        <section className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm sm:mt-8 sm:p-5" aria-labelledby="quick-actions-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-slate uppercase">Shortcuts</p>
              <h2 id="quick-actions-heading" className="mt-1 font-heading text-xl text-ink">Keep work moving</h2>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-slate">{actor.role.replaceAll("_", " ")}</span>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="group min-h-11 rounded-xl border border-border bg-background px-4 py-3 transition hover:-translate-y-0.5 hover:border-ink hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                <span className="flex items-center justify-between gap-3 text-sm font-semibold text-ink"><span>{action.label}</span><span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span></span>
                <span className="mt-1 block text-xs leading-5 text-slate">{action.hint}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <div className="mt-8 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-slate uppercase">At a glance</p>
          <h2 className="mt-1 font-heading text-xl text-ink">Today&apos;s workload</h2>
        </div>
        <span className="hidden text-xs text-slate sm:inline">Live operational counts</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
        {canReadQuotes ? quoteStatuses.map((status) => (
          <Link
            key={status}
            href="/admin/quotes"
            className={`group min-h-28 rounded-xl border border-border border-t-4 ${quoteMetricTone[status] ?? "border-t-border"} bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink`}
          >
            <p className="text-xs tracking-[0.14em] text-slate uppercase"><AdminStatusBadge status={status} /></p>
            <p className="mt-2 font-heading text-3xl tabular-nums text-ink">
              {quoteCounts.get(status) ?? 0}
            </p>
          </Link>
        )) : null}
        {canReadOrders ? <Link
          href="/admin/orders"
          className="group min-h-28 rounded-xl border border-border border-t-4 border-t-ochre bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
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
          className="group min-h-28 rounded-xl border border-border border-t-4 border-t-paper-green bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <p className="text-xs tracking-[0.14em] text-slate uppercase">
            Nationwide arranging
          </p>
          <p className="mt-2 font-heading text-3xl tabular-nums text-ink">
            {nationwide?.total ?? 0}
          </p>
        </Link> : null}
        {canReadReviews ? <Link href="/admin/reviews" className="group min-h-28 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"><p className="text-xs tracking-[0.14em] text-slate uppercase">Pending reviews</p><p className="mt-2 font-heading text-3xl tabular-nums text-ink">{pendingReviews?.total ?? 0}</p><p className="mt-1 text-xs text-slate">Moderation queue</p></Link> : null}
        {!canReadQuotes && !canReadOrders && !canReadReviews ? <div className="rounded-xl border border-dashed border-border bg-card p-4 sm:col-span-2 lg:col-span-5"><p className="text-sm font-semibold text-ink">Your workspace is ready</p><p className="mt-1 text-sm text-slate">Use the shortcuts above to manage the areas assigned to your role.</p></div> : null}
      </div>
      {canReadOrders ? <section className="mt-8 rounded-xl border border-border bg-surface p-5 sm:p-6" aria-labelledby="recent-orders-heading"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs tracking-[0.14em] text-slate uppercase">Live queue</p><h2 id="recent-orders-heading" className="mt-1 font-heading text-xl text-ink">Recently updated orders</h2></div><Link href="/admin/orders" className="min-h-11 inline-flex items-center text-sm font-medium text-ink underline underline-offset-4">View all</Link></div>{recentOrders.length ? <div className="mt-5 overflow-x-auto"><table className="admin-responsive-table w-full min-w-[38rem] text-sm"><thead><tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-slate"><th className="px-2 py-3 font-medium">Order</th><th className="px-2 py-3 font-medium">Customer</th><th className="px-2 py-3 font-medium">Status</th><th className="px-2 py-3 font-medium">Updated</th></tr></thead><tbody>{recentOrders.map((order) => <tr key={order.id} className="border-b border-border last:border-0"><td className="px-2 py-3 font-medium text-ink" data-label="Order"><Link href={`/admin/orders/${order.id}`} className="underline underline-offset-4">{order.number ?? "Draft order"}</Link></td><td className="px-2 py-3 text-slate" data-label="Customer">{order.customerEmail ?? "Guest checkout"}</td><td className="px-2 py-3" data-label="Status"><AdminStatusBadge status={order.status} /></td><td className="px-2 py-3 text-slate" data-label="Updated">{new Date(order.updatedAt).toLocaleDateString("en-GH")}</td></tr>)}</tbody></table></div> : <p className="mt-5 text-sm text-slate">No orders have been updated yet.</p>}</section> : null}
      {seoAudit ? <section className="mt-8 rounded-xl border border-border bg-surface p-5 sm:p-6" aria-labelledby="seo-health-heading"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs tracking-[0.14em] text-slate uppercase">Catalogue quality</p><h2 id="seo-health-heading" className="mt-1 font-heading text-xl text-ink">SEO health</h2><p className="mt-2 max-w-2xl text-sm text-slate">Active products with complete descriptions, images and aliases are easier to discover and easier for customers to understand.</p></div><Link href="/admin/products?status=active" className="min-h-11 inline-flex items-center text-sm font-medium text-ink underline underline-offset-4">Review products</Link></div><div className="mt-5 grid gap-3 sm:grid-cols-4"><div className="rounded-lg border border-border bg-card p-4"><p className="text-xs uppercase tracking-[0.12em] text-slate">Active products</p><p className="mt-2 font-heading text-2xl text-ink">{seoAudit.activeProducts}</p></div><div className="rounded-lg border border-border bg-card p-4"><p className="text-xs uppercase tracking-[0.12em] text-slate">Missing descriptions</p><p className="mt-2 font-heading text-2xl text-ink">{seoAudit.missingDescriptions}</p></div><div className="rounded-lg border border-border bg-card p-4"><p className="text-xs uppercase tracking-[0.12em] text-slate">Missing images</p><p className="mt-2 font-heading text-2xl text-ink">{seoAudit.missingImages}</p></div><div className="rounded-lg border border-border bg-card p-4"><p className="text-xs uppercase tracking-[0.12em] text-slate">Missing aliases</p><p className="mt-2 font-heading text-2xl text-ink">{seoAudit.missingAliases}</p></div></div></section> : null}
    </main>
  );
}
