import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/account/sign-out-button";
import { listCustomerAddresses } from "@/features/account/addresses";
import { getCustomerOrganisation } from "@/features/account/organisation";
import { listCustomerOrders, listCustomerQuotes } from "@/features/account/history";
import { requireCustomer } from "@/lib/customer/require";
import { formatGhs } from "@/lib/money";

export const metadata: Metadata = { title: "Account", robots: { index: false, follow: false } };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ authError?: string }> }) {
  const actor = await requireCustomer("/account");
  const [addresses, org, orders, quotes, query] = await Promise.all([
    listCustomerAddresses(actor.profileId), getCustomerOrganisation(actor.profileId),
    listCustomerOrders(actor.profileId), listCustomerQuotes(actor.profileId), searchParams,
  ]);
  return (
    <main>
      <h1 className="text-3xl text-ink">Account</h1>
      <p className="mt-3 text-slate">Signed in as {actor.fullName} · {actor.email}. Your retail cart and quote list stay separate.</p>
      {query.authError === "sign-out" ? <p role="alert" className="mt-4 text-error">We could not sign you out. Please try again.</p> : null}
      <section className="mt-8" aria-labelledby="account-actions">
        <h2 id="account-actions" className="font-heading text-xl text-ink">What would you like to do?</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          {[
            ["/shop", "Shop products", "Browse the catalogue"],
            ["/quick-order", "Quick order", "Use a SKU or product name"],
            ["/cart", "Open cart", "Review retail items"],
            ["/quote", "Open quote", "Review quote items"],
          ].map(([href, label, description]) => (
            <Link key={href} href={href} className="group rounded-xl border border-border bg-surface p-4 text-ink transition hover:-translate-y-0.5 hover:border-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              <span className="block font-medium">{label}</span>
              <span className="mt-1 block text-xs leading-5 text-slate group-hover:text-ink">{description}</span>
            </Link>
          ))}
        </div>
      </section>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/account/addresses" className="group rounded-xl border border-border bg-surface p-5 text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          <span className="text-sm text-slate">Saved addresses</span>
          <span className="mt-1 block font-heading text-xl">{addresses.length} {addresses.length === 1 ? "address" : "addresses"}</span>
          <span className="mt-3 block text-sm underline underline-offset-4 group-hover:no-underline">Manage addresses</span>
        </Link>
        <Link href="/account/organisation" className="group rounded-xl border border-border bg-surface p-5 text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          <span className="text-sm text-slate">Organisation account</span>
          <span className="mt-1 block font-heading text-xl">{org ? org.name : "Not set up"}</span>
          <span className="mt-3 block text-sm underline underline-offset-4 group-hover:no-underline">{org ? "View organisation" : "Add organisation"}</span>
        </Link>
      </div>
      <section className="mt-8" aria-labelledby="recent-orders">
        <h2 id="recent-orders" className="font-heading text-xl text-ink">Recent orders</h2>
        {orders.length ? <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-surface">{orders.slice(0, 3).map((order) => <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"><Link href={`/order/${order.number}`} className="font-medium text-ink underline underline-offset-4">{order.number}</Link><span className="text-sm capitalize text-slate">{order.status.replaceAll("_", " ")} · <span className="tabular-nums">{formatGhs(order.grandTotal)}</span></span></li>)}</ul> : <p className="mt-3 text-slate">No orders yet. <Link href="/shop" className="underline">Shop products</Link></p>}
        <Link href="/account/orders" className="mt-3 inline-block text-sm underline">All orders</Link>
      </section>
      <section className="mt-8" aria-labelledby="recent-quotes">
        <h2 id="recent-quotes" className="font-heading text-xl text-ink">Recent quotations</h2>
        {quotes.length ? <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-surface">{quotes.slice(0, 3).map((quote) => <li key={quote.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"><Link href={quote.status === "draft" ? "/quote" : `/quote/${quote.id}`} className="font-medium text-ink underline underline-offset-4">{quote.number ?? "Draft quote"}</Link><span className="text-sm capitalize text-slate">{quote.status.replaceAll("_", " ")}</span></li>)}</ul> : <p className="mt-3 text-slate">No quotations yet. <Link href="/quick-order" className="underline">Start with Quick Order</Link></p>}
        <Link href="/account/quotes" className="mt-3 inline-block text-sm underline">All quotations</Link>
      </section>
      <div className="mt-8"><SignOutButton /></div>
    </main>
  );
}
