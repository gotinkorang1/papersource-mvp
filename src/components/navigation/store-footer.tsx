import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 text-sm leading-relaxed text-slate sm:px-6 md:grid-cols-[1.1fr_0.9fr_1fr] lg:px-8">
        <div>
          <p className="font-heading text-base font-semibold text-ink">PaperSource</p>
          <p className="mt-2">Accra &amp; Tema delivery. Nationwide supply on request.</p>
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
