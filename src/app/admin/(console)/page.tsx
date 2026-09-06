import type { Metadata } from "next";
import Link from "next/link";
import { count, eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { orders, quotes } from "@/lib/db/schema";
import { requireStaffArea } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminDashboardPage() {
  await requireStaffArea("dashboard", "read");
  const db = getDb();

  const openQuotes = await db
    .select({ status: quotes.status, total: count() })
    .from(quotes)
    .where(
      inArray(quotes.status, ["submitted", "under_review", "priced", "sent"]),
    )
    .groupBy(quotes.status);

  const [pendingPay] = await db
    .select({ total: count() })
    .from(orders)
    .where(eq(orders.status, "pending_payment"));

  const [nationwide] = await db
    .select({ total: count() })
    .from(orders)
    .where(eq(orders.status, "awaiting_terms"));

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Operations</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">Dashboard</h1>
      <p className="mt-3 max-w-2xl text-slate">
        Quote queue, unpaid orders, and catalogue desks. Do not operate this
        business from Supabase Studio.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {openQuotes.map((row) => (
          <Link
            key={row.status}
            href="/admin/quotes"
            className="group rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <p className="text-xs tracking-[0.14em] text-slate uppercase">
              {row.status.replaceAll("_", " ")}
            </p>
            <p className="mt-2 font-heading text-3xl tabular-nums text-ink">
              {row.total}
            </p>
          </Link>
        ))}
        <Link
          href="/admin/orders"
          className="group rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <p className="text-xs tracking-[0.14em] text-slate uppercase">
            Awaiting Paystack
          </p>
          <p className="mt-2 font-heading text-3xl tabular-nums text-ink">
            {pendingPay?.total ?? 0}
          </p>
        </Link>
        <Link
          href="/admin/orders"
          className="group rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <p className="text-xs tracking-[0.14em] text-slate uppercase">
            Nationwide arranging
          </p>
          <p className="mt-2 font-heading text-3xl tabular-nums text-ink">
            {nationwide?.total ?? 0}
          </p>
        </Link>
      </div>
    </main>
  );
}
