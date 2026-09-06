import Link from "next/link";
import { Wordmark } from "@/components/marketing/wordmark";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 text-sm leading-relaxed text-slate sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div>
          <Wordmark shrinkOnScroll={false} className="max-w-fit" />
          <p className="mt-4 max-w-xs">Ghana&apos;s modern workplace supply partner. Accra and Tema delivery, with nationwide supply on request.</p>
          <Link href="/contact" className="mt-5 inline-flex min-h-10 items-center rounded-lg bg-ink px-4 py-2 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Talk to our team</Link>
        </div>
        <div>
          <p className="font-semibold text-ink">Explore</p>
          <nav className="mt-3 grid gap-2" aria-label="Explore">
            <Link href="/shop" className="w-fit hover:text-ink hover:underline underline-offset-4">Shop products</Link>
            <Link href="/brands" className="w-fit hover:text-ink hover:underline underline-offset-4">Brands</Link>
            <Link href="/quick-order" className="w-fit hover:text-ink hover:underline underline-offset-4">Quick Order</Link>
            <Link href="/business" className="w-fit hover:text-ink hover:underline underline-offset-4">Business accounts</Link>
          </nav>
        </div>
        <div>
          <p className="font-semibold text-ink">Support</p>
          <nav className="mt-3 grid gap-2" aria-label="Support">
            <Link href="/about" className="w-fit hover:text-ink hover:underline underline-offset-4">About us</Link>
            <Link href="/delivery" className="w-fit hover:text-ink hover:underline underline-offset-4">Delivery</Link>
            <Link href="/faq" className="w-fit hover:text-ink hover:underline underline-offset-4">FAQs</Link>
            <Link href="/returns" className="w-fit hover:text-ink hover:underline underline-offset-4">Returns</Link>
          </nav>
        </div>
        <div>
          <p className="font-semibold text-ink">Visit and contact</p>
          <p className="mt-3">Kanda · Asylum Down</p>
          <p className="mt-2 flex flex-wrap gap-x-2"><a href="tel:+233555001313" className="hover:text-ink hover:underline underline-offset-4">0555 001 313</a><span aria-hidden>·</span><a href="tel:+233552767156" className="hover:text-ink hover:underline underline-offset-4">0552 767 156</a></p>
          <a href="mailto:info@papersourcegh.com" className="mt-2 inline-block hover:text-ink hover:underline underline-offset-4">info@papersourcegh.com</a>
          <p className="mt-2 text-xs">WhatsApp for questions and quote discussion — not checkout.</p>
        </div>
      </div>
      <div className="border-t border-border/70 bg-cream/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-xs text-slate sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>PaperSource · A subsidiary of NiiPlants Group Ghana Limited</p>
          <nav className="flex gap-4" aria-label="Legal"><Link href="/privacy" className="hover:text-ink hover:underline underline-offset-4">Privacy</Link><Link href="/terms" className="hover:text-ink hover:underline underline-offset-4">Terms</Link></nav>
        </div>
      </div>
    </footer>
  );
}
