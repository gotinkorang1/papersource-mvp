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
        Quote queue and unpaid orders. Catalogue, settings, and emails land in
        later phases — do not operate this business from Supabase Studio.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {openQuotes.map((row) => (
          <Link
            key={row.status}
            href="/admin/quotes"
            className="rounded-md border border-border bg-white p-4 hover:border-ink"
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
          className="rounded-md border border-border bg-white p-4 hover:border-ink"
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
          className="rounded-md border border-border bg-white p-4 hover:border-ink"
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
