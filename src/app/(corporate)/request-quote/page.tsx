import type { Metadata } from "next";
import Link from "next/link";
import { RfqForm } from "@/components/quotes/rfq-form";
import { listQuoteLines } from "@/features/quotations/repository";
import { isDatabaseConfigured } from "@/lib/db/client";
import { readGuestSessionId } from "@/lib/session/guest";

export const metadata: Metadata = {
  title: "Request a quote",
  robots: { index: false, follow: true },
};

export default async function RequestQuotePage() {
  const sessionId = isDatabaseConfigured() ? await readGuestSessionId() : null;
  const lines = sessionId ? await listQuoteLines(sessionId) : [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl text-ink">Request a quote</h1>
      <p className="mt-3 text-slate">
        Guests can submit. Organisation, phone and email are required. Optional
        PDF, Excel, Word or image attachments stay private.
      </p>
      {lines.length === 0 ? (
        <p className="mt-8 text-slate">
          Add lines to your{" "}
          <Link href="/quote" className="underline">
            quote list
          </Link>{" "}
          first.
        </p>
      ) : (
        <>
          <ul className="mt-8 list-disc space-y-1 pl-5 text-sm text-ink">
            {lines.map((line) => (
              <li key={line.id}>
                {line.name} × {line.quantity}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <RfqForm />
          </div>
        </>
      )}
    </main>
  );
}
