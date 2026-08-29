import Link from "next/link";

export function StoreFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate md:flex-row md:items-center md:justify-between">
        <p>PaperSource · Accra &amp; Tema delivery. Nationwide on request.</p>
        <p>
          WhatsApp is for questions and quote discussion — not checkout.{" "}
          <Link href="/business" className="text-ink underline">
            Business
          </Link>
        </p>
      </div>
    </footer>
  );
}
