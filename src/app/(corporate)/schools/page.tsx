import type { Metadata } from "next";
import Link from "next/link";
import { paperButton } from "@/components/commerce/paper-button";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "School stationery supplier in Ghana", description: "Classroom packs and bulk stationery for Ghanaian schools. Request a quotation as a guest; accounts are optional.", path: "/schools" });

export default function SchoolsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Schools</p>
      <h1 className="mt-2 text-3xl text-ink">Classroom stationery, quoted as a list</h1>
      <p className="mt-4 text-slate">
        The Classroom Pack is a starting set. Add more SKUs with Quick Order
        when a term list arrives as a spreadsheet. Guests can submit an RFQ.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/quick-order" className={paperButton({ variant: "quote" })}>
          Quick Order
        </Link>
        <Link href="/request-quote" className={paperButton({ variant: "secondary" })}>
          Request a school quote
        </Link>
      </div>
    </main>
  );
}
