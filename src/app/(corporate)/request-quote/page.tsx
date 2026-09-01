import type { Metadata } from "next";
import Link from "next/link";
import { RfqForm } from "@/components/quotes/rfq-form";
import { readCustomerActor } from "@/lib/customer/require";
import { getCustomerOrganisation } from "@/features/account/organisation";
import { listCustomerAddresses } from "@/features/account/addresses";
import { listQuoteLines } from "@/features/quotations/repository";
import { isDatabaseConfigured } from "@/lib/db/client";
import { readCommerceIdentity } from "@/lib/customer/commerce";

export const metadata: Metadata = {
  title: "Request a quote",
  robots: { index: false, follow: true },
};

export default async function RequestQuotePage() {
  const sessionId = isDatabaseConfigured() ? await readCommerceIdentity() : null;
  const lines = sessionId ? await listQuoteLines(sessionId) : [];
  const customer = isDatabaseConfigured() ? await readCustomerActor() : null;
  const organization = customer ? await getCustomerOrganisation(customer.profileId) : null;
  const saved = customer ? await listCustomerAddresses(customer.profileId) : [];
  const preferred = saved.find((address) => address.isDefault) ?? saved[0];

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
            <RfqForm customer={customer ?? undefined} organization={organization}
              defaultAddress={preferred ? {
                fullName: preferred.fullName, phone: preferred.phone,
                region: preferred.region, cityTown: preferred.cityTown,
                areaSuburb: preferred.areaSuburb ?? "", streetLandmark: preferred.streetLandmark ?? "",
                ghanapostGps: preferred.ghanapostGps ?? "", deliveryInstructions: preferred.deliveryInstructions ?? "",
                deliveryArea: preferred.deliveryArea === "tema" || preferred.deliveryArea === "other" ? preferred.deliveryArea : "accra",
              } : undefined} />
          </div>
        </>
      )}
    </main>
  );
}
