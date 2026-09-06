import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact PaperSource",
  description: "Contact PaperSource in Ghana by phone, email or at our Kanda and Asylum Down locations.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <p className="text-sm tracking-[0.16em] text-slate uppercase">Contact PaperSource</p>
          <h1 className="mt-4 text-4xl text-ink md:text-5xl">Let&apos;s make your next order easier.</h1>
          <p className="mt-5 text-lg text-slate">Our team can help with product questions, bulk requirements, delivery and quotations.</p>
          <div className="mt-8 space-y-6">
            <div><p className="font-medium text-ink">Phone</p><p className="mt-2 flex flex-wrap gap-x-3 gap-y-1"><a href="tel:+233555001313" className="text-ink underline underline-offset-2">0555 001 313</a><a href="tel:+233552767156" className="text-ink underline underline-offset-2">0552 767 156</a></p></div>
            <div><p className="font-medium text-ink">Email</p><a href="mailto:info@papersourcegh.com" className="mt-2 inline-block text-ink underline underline-offset-2">info@papersourcegh.com</a></div>
            <div><p className="font-medium text-ink">Physical locations</p><p className="mt-2 text-slate">Kanda<br />Asylum Down</p></div>
          </div>
          <div className="mt-10 flex flex-wrap gap-3"><Link href="/request-quote" className="inline-flex min-h-11 items-center rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink/90">Request a Quote</Link><Link href="/shop" className="inline-flex min-h-11 items-center rounded-md border border-ink px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-cream">Shop products</Link></div>
        </div>
        <div className="relative min-h-80 overflow-hidden rounded-xl border border-border bg-cream shadow-[0_20px_50px_rgba(16,42,67,0.1)] lg:min-h-full"><Image src="/images/aerial-view-african-descent-woman-working-computer-white-table-office.jpg" alt="Workplace desk with stationery and computer" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /></div>
      </div>
    </main>
  );
}
