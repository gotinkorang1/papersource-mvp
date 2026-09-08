import type { Metadata } from "next";
import Link from "next/link";
import { paperButton } from "@/components/commerce/paper-button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Bulk stationery orders in Ghana", description: "Request bulk paper, toner and workplace packs for Accra and Tema. Nationwide supply is arranged on request with delivery confirmed before charging.", path: "/bulk-orders" });

export default function BulkOrdersPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Procurement</p>
      <h1 className="mt-2 text-3xl text-ink">Bulk orders</h1>
      <p className="mt-4 text-slate">
        One catalogue for a single ream or a school year. Paste SKUs into Quick
        Order, or browse and add lines to the quote basket. Sales prices the
        list; Accra and Tema delivery is calculated; other regions stay on
        request.
      </p>
      <p className="mt-3 text-slate">
        Office packs — new hire, small office, and classroom — are ready if you
        need a first order without building every line.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/quick-order" className={paperButton({ variant: "quote" })}>
          Quick Order
        </Link>
        <Link href="/request-quote" className={paperButton({ variant: "secondary" })}>
          Request a quotation
        </Link>
      </div>
    </main>
  );
}
