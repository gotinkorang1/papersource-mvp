import Link from "next/link";
import { Wordmark } from "@/components/marketing/wordmark";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 text-sm leading-relaxed text-slate sm:px-6 md:grid-cols-[1.1fr_0.9fr_1fr] lg:px-8">
        <div>
          <Wordmark shrinkOnScroll={false} className="max-w-fit" />
          <p className="mt-2">Accra &amp; Tema delivery. Nationwide supply on request.</p>
          <p className="mt-3 flex gap-3"><Link href="/about" className="text-ink underline underline-offset-2">About us</Link><Link href="/contact" className="text-ink underline underline-offset-2">Contact</Link></p>
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1"><Link href="/delivery" className="text-ink underline underline-offset-2">Delivery</Link><Link href="/faq" className="text-ink underline underline-offset-2">FAQ</Link><Link href="/returns" className="text-ink underline underline-offset-2">Returns</Link><Link href="/privacy" className="text-ink underline underline-offset-2">Privacy</Link><Link href="/terms" className="text-ink underline underline-offset-2">Terms</Link></p>
        </div>
        <div>
          <p className="font-medium text-ink">Visit us</p>
          <p className="mt-2">Kanda · Asylum Down</p>
        </div>
        <div>
          <p className="font-medium text-ink">Call us</p>
          <p className="mt-2 flex flex-wrap gap-x-2">
            <a href="tel:+233555001313" className="text-ink underline underline-offset-2">0555 001 313</a>
            <span aria-hidden>·</span>
            <a href="tel:+233552767156" className="text-ink underline underline-offset-2">0552 767 156</a>
          </p>
          <p className="mt-3">WhatsApp is for questions and quote discussion — not checkout. <Link href="/quick-order" className="text-ink underline underline-offset-2">Quick Order</Link> · <Link href="/business" className="text-ink underline underline-offset-2">Business</Link></p>
        </div>
      </div>
    </footer>
  );
}
