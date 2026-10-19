import type { Metadata } from "next";
import Link from "next/link";
import { SignOutButton } from "@/components/account/sign-out-button";
import { listCustomerAddresses } from "@/features/account/addresses";
import { getCustomerOrganisation } from "@/features/account/organisation";
import { listCustomerOrders, listCustomerQuotes } from "@/features/account/history";
import { requireCustomer } from "@/lib/customer/require";
import { formatGhs } from "@/lib/money";

export const metadata: Metadata = { title: "Account", robots: { index: false, follow: false } };

const openQuoteStatuses = new Set(["submitted", "under_review", "priced", "sent", "accepted", "payment_pending"]);

function quoteHref(quote: { status: string; accessToken: string | null }) {
  if (quote.status === "draft") return "/quote";
  return quote.accessToken ? `/quote/${quote.accessToken}` : "/account/quotes";
}

function formatDate(value: Date) {
  return new Date(value).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ authError?: string }> }) {
  const actor = await requireCustomer("/account");
  const [addresses, org, orders, quotes, query] = await Promise.all([
    listCustomerAddresses(actor.profileId), getCustomerOrganisation(actor.profileId),
    listCustomerOrders(actor.profileId), listCustomerQuotes(actor.profileId), searchParams,
  ]);
  const firstName = actor.fullName.trim().split(/\s+/)[0];
  const attention = [
    ...quotes.filter((quote) => quote.status === "sent").map((quote) => ({
      key: `quote-${quote.id}`,
      href: quoteHref(quote),
      title: quote.number ? `Quotation ${quote.number} is ready` : "Your quotation is ready",
      detail: `Priced at ${formatGhs(quote.grandTotal)}. Review and accept to place the order.`,
      action: "Review quote",
    })),
    ...orders.filter((order) => order.status === "pending_payment").map((order) => ({
      key: `order-${order.id}`,
      href: `/order/${order.number}`,
      title: `Order ${order.number} is awaiting payment`,
      detail: `${formatGhs(order.grandTotal)} due. Complete payment to confirm your order.`,
      action: "Complete payment",
    })),
  ];
  const openQuoteCount = quotes.filter((quote) => openQuoteStatuses.has(quote.status)).length;
  return (
    <main>
      <section className="rounded-3xl border border-border bg-muted/30 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-paper-green">Your workspace</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-ink md:text-5xl">{firstName ? `Welcome back, ${firstName}.` : "Welcome back."}</h1>
        <p className="mt-3 text-slate">Signed in as {actor.email}. Your retail cart and quote list stay separate.</p>
      </section>
      {query.authError === "sign-out" ? <p role="alert" className="mt-4 text-error">We could not sign you out. Please try again.</p> : null}
      {attention.length ? (
        <section className="mt-8 rounded-2xl border border-ochre/40 bg-ochre/5 p-5 sm:p-6" aria-labelledby="account-attention">
          <h2 id="account-attention" className="font-heading text-xl font-semibold text-ink">Needs your attention</h2>
          <ul className="mt-3 grid gap-3">
            {attention.slice(0, 4).map((item) => (
              <li key={item.key} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                <span className="min-w-0">
                  <span className="block font-medium text-ink">{item.title}</span>
                  <span className="mt-0.5 block text-sm text-slate">{item.detail}</span>
                </span>
                <Link href={item.href} className="inline-flex min-h-11 items-center rounded-lg bg-ink px-4 text-sm font-semibold text-cream transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">{item.action}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <dl className="mt-8 grid gap-3 sm:grid-cols-3">
        {([
          ["Orders", orders.length, "/account/orders"],
          ["Open quotations", openQuoteCount, "/account/quotes"],
          ["Awaiting payment", orders.filter((order) => order.status === "pending_payment").length, "/account/orders"],
        ] as const).map(([label, value, href]) => (
          <div key={label} className="relative rounded-xl border border-border bg-surface p-4 shadow-sm transition hover:border-ink">
            <dt className="text-sm text-slate"><Link href={href} className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">{label}</Link></dt>
            <dd className="mt-1 font-heading text-2xl tabular-nums text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <section className="mt-8" aria-labelledby="account-actions">
        <h2 id="account-actions" className="font-heading text-xl font-semibold text-ink">What would you like to do?</h2>
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
        <h2 id="recent-orders" className="font-heading text-xl font-semibold text-ink">Recent orders</h2>
        {orders.length ? <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-surface">{orders.slice(0, 3).map((order) => <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"><Link href={`/order/${order.number}`} className="font-medium text-ink underline underline-offset-4">{order.number}</Link><span className="text-sm capitalize text-slate">{order.status.replaceAll("_", " ")} · <span className="tabular-nums">{formatGhs(order.grandTotal)}</span> · <span className="normal-case">{formatDate(order.createdAt)}</span></span></li>)}</ul> : <p className="mt-3 text-slate">No orders yet. <Link href="/shop" className="underline">Shop products</Link></p>}
        <Link href="/account/orders" className="mt-3 inline-block text-sm underline">All orders</Link>
      </section>
      <section className="mt-8" aria-labelledby="recent-quotes">
        <h2 id="recent-quotes" className="font-heading text-xl font-semibold text-ink">Recent quotations</h2>
        {quotes.length ? <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-surface">{quotes.slice(0, 3).map((quote) => <li key={quote.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"><Link href={quoteHref(quote)} className="font-medium text-ink underline underline-offset-4">{quote.number ?? "Draft quote"}</Link><span className="text-sm capitalize text-slate">{quote.status.replaceAll("_", " ")}{quote.grandTotal > 0 ? <> · <span className="tabular-nums">{formatGhs(quote.grandTotal)}</span></> : null} · <span className="normal-case">{formatDate(quote.createdAt)}</span></span></li>)}</ul> : <p className="mt-3 text-slate">No quotations yet. <Link href="/quick-order" className="underline">Start with Quick Order</Link></p>}
        <Link href="/account/quotes" className="mt-3 inline-block text-sm underline">All quotations</Link>
      </section>
      <div className="mt-8"><SignOutButton /></div>
    </main>
  );
}
