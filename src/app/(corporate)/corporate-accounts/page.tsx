import type { Metadata } from "next";
import Link from "next/link";
import { paperButton } from "@/components/commerce/paper-button";

export const metadata: Metadata = {
  title: "Organisation accounts | PaperSource Ghana",
  description:
    "Create a PaperSource account to keep Ghana addresses, quotations and orders for your school or business.",
};

export default function CorporateAccountsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Accounts</p>
      <h1 className="mt-2 text-3xl text-ink">Organisation accounts</h1>
      <p className="mt-4 text-slate">
        Guests can request a quotation today. An account keeps the address book
        and lets you open past quotes without the email token. Credit ledgers
        are not part of this phase.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/register" className={paperButton()}>
          Create account
        </Link>
        <Link href="/quick-order" className={paperButton({ variant: "quote" })}>
          Start a quote
        </Link>
      </div>
    </main>
  );
}
