import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-10 text-sm leading-relaxed text-slate sm:px-6 md:flex-row md:items-center md:justify-between md:gap-8 lg:px-8">
        <p>PaperSource · Accra &amp; Tema delivery. Nationwide on request.</p>
        <p>
          WhatsApp is for questions and quote discussion — not checkout.{" "}
          <Link href="/quick-order" className="text-ink underline">
            Quick Order
          </Link>
          {" · "}
          <Link href="/business" className="text-ink underline">
            Business
          </Link>
        </p>
      </div>
    </footer>
  );
}
