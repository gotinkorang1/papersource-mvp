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
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/account/addresses" className="rounded-md border border-border bg-white p-5 text-ink underline">{addresses.length} saved {addresses.length === 1 ? "address" : "addresses"}</Link>
        <Link href="/account/organisation" className="rounded-md border border-border bg-white p-5 text-ink underline">{org ? org.name : "Add an organisation (optional)"}</Link>
      </div>
      <section className="mt-8" aria-labelledby="recent-orders">
        <h2 id="recent-orders" className="font-heading text-xl text-ink">Recent orders</h2>
        {orders.length ? <ul className="mt-3 space-y-3">{orders.slice(0, 3).map((order) => <li key={order.id}><Link href={`/order/${order.number}`} className="underline">{order.number}</Link> · {order.status.replaceAll("_", " ")} · {formatGhs(order.grandTotal)}</li>)}</ul> : <p className="mt-3 text-slate">No orders yet. <Link href="/shop" className="underline">Shop products</Link></p>}
        <Link href="/account/orders" className="mt-3 inline-block text-sm underline">All orders</Link>
      </section>
      <section className="mt-8" aria-labelledby="recent-quotes">
        <h2 id="recent-quotes" className="font-heading text-xl text-ink">Recent quotations</h2>
        {quotes.length ? <ul className="mt-3 space-y-3">{quotes.slice(0, 3).map((quote) => <li key={quote.id}><Link href={quote.status === "draft" ? "/quote" : `/quote/${quote.id}`} className="underline">{quote.number ?? "Draft quote"}</Link> · {quote.status.replaceAll("_", " ")}</li>)}</ul> : <p className="mt-3 text-slate">No quotations yet. <Link href="/quick-order" className="underline">Start with Quick Order</Link></p>}
        <Link href="/account/quotes" className="mt-3 inline-block text-sm underline">All quotations</Link>
      </section>
      <div className="mt-8"><SignOutButton /></div>
    </main>
  );
}
