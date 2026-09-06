import type { Metadata } from "next";
import { AddressForm, AddressMutationButton } from "@/components/account/address-form";
import { listCustomerAddresses } from "@/features/account/addresses";
import { requireCustomer } from "@/lib/customer/require";

export const metadata: Metadata = { title: "Addresses", robots: { index: false, follow: false } };

export default async function AccountAddressesPage() {
  const actor = await requireCustomer("/account/addresses");
  const rows = await listCustomerAddresses(actor.profileId);
  return (
    <main>
      <h1 className="text-3xl text-ink">Addresses</h1>
      <p className="mt-3 text-slate">Saved personal Ghana addresses for checkout. Phone is required. Organisation addresses stay separate.</p>
      {rows.length === 0 ? <p className="mt-6 text-slate">No saved addresses yet. Add your first address below.</p> : null}
      <ul className="mt-8 space-y-4">
        {rows.map((row) => (
          <li key={row.id} className="rounded-xl border border-border bg-surface p-5 text-sm shadow-sm transition-shadow hover:shadow-md">
            <p className="font-medium text-ink">{row.fullName}{row.isDefault ? " · Default" : ""}</p>
            <p className="text-slate">{row.phone} · {row.cityTown}, {row.region}</p>
            <p className="text-slate">{[row.areaSuburb, row.streetLandmark, row.ghanapostGps].filter(Boolean).join(" · ")}</p>
            <div className="mt-2 flex flex-wrap gap-x-6">
              {!row.isDefault ? <AddressMutationButton addressId={row.id} intent="default" /> : null}
              <AddressMutationButton addressId={row.id} intent="remove" />
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer py-2 font-medium text-ink underline focus-visible:outline-2 focus-visible:outline-ink">Edit address</summary>
              <AddressForm addressId={row.id} isDefault={row.isDefault} defaultValues={{
                fullName: row.fullName, phone: row.phone, region: row.region, cityTown: row.cityTown,
                areaSuburb: row.areaSuburb ?? "", streetLandmark: row.streetLandmark ?? "",
                ghanapostGps: row.ghanapostGps ?? "", deliveryInstructions: row.deliveryInstructions ?? "",
                deliveryArea: row.deliveryArea === "tema" || row.deliveryArea === "other" ? row.deliveryArea : "accra",
              }} />
            </details>
          </li>
        ))}
      </ul>
      <section className="mt-10" aria-labelledby="add-address">
        <h2 id="add-address" className="mb-4 font-heading text-xl text-ink">Add address</h2>
        <AddressForm defaultValues={{ fullName: actor.fullName, phone: actor.phone ?? "" }} isDefault={rows.length === 0} />
      </section>
    </main>
  );
}
