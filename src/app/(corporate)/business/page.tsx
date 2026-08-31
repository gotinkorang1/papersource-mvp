import type { Metadata } from "next";
import Link from "next/link";
import { paperButton } from "@/components/commerce/paper-button";

export const metadata: Metadata = {
  title: "Workplace supplies for Ghanaian businesses | PaperSource",
  description:
    "PaperSource supplies Accra and Tema offices with paper, toner and stationery. Build a quote list, request pricing, and keep retail checkout separate.",
};

export default function BusinessPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Business</p>
      <h1 className="mt-2 text-3xl text-ink">Procurement without a second catalogue</h1>
      <p className="mt-4 text-slate">
        Build a quote list from the same products a colleague can buy at the
        published price. WhatsApp is for questions — Submit and Accept stay on
        the site.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/quick-order" className={paperButton({ variant: "quote" })}>
          Start with SKUs
        </Link>
        <Link href="/quote" className={paperButton({ variant: "secondary" })}>
          Open quote list
        </Link>
      </div>
    </main>
  );
}
