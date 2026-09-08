import type { Metadata } from "next";
import Link from "next/link";
import { QuickOrderForm } from "@/components/quotes/quick-order-form";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Quick Order by SKU", description: "Paste product SKUs and quantities to build a PaperSource Ghana quotation for Accra and Tema offices.", path: "/quick-order" });

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function QuickOrderPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Procurement</p>
      <h1 className="mt-2 text-3xl text-ink">Quick Order</h1>
      <p className="mt-3 text-slate">
        Built for procurement desks. Enter SKUs and quantities, then add the
        list to your quote basket. Retail cart is optional and stays separate.
        Final quote prices are still set by PaperSource.
      </p>
      <p className="mt-2 text-sm text-slate">
        Examples: <span className="font-mono text-ink">DA-A4-80-500</span>,{" "}
        <span className="font-mono text-ink">HP-305-BLK</span>,{" "}
        <span className="font-mono text-ink">PS-BDL-SMLOFF</span>.
      </p>
      {error ? (
        <p role="alert" className="mt-6 border border-error/40 bg-white px-4 py-3 text-sm text-error">
          {error}
        </p>
      ) : null}
      <QuickOrderForm />
      <p className="mt-8 text-sm text-slate">
        Prefer browsing?{" "}
        <Link href="/shop" className="underline">
          Shop the catalogue
        </Link>{" "}
        or{" "}
        <Link href="/quote" className="underline">
          open the quote list
        </Link>
        .
      </p>
    </main>
  );
}
