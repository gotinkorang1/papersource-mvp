import type { Metadata } from "next";
import { OrganisationForm } from "@/components/account/organisation-form";
import { getCustomerOrganisation } from "@/features/account/organisation";
import { requireCustomer } from "@/lib/customer/require";

export const metadata: Metadata = { title: "Organisation", robots: { index: false, follow: false } };

export default async function AccountOrganisationPage() {
  const actor = await requireCustomer("/account/organisation");
  const org = await getCustomerOrganisation(actor.profileId);
  return (
    <main>
      <h1 className="text-3xl text-ink">Organisation</h1>
      <p className="mt-3 text-slate">Optional. Keep one organisation for quotations and orders. You choose when to submit a request on its behalf.</p>
      {org?.role === "member" ? (
        <section className="mt-8 space-y-3 rounded-xl border border-border bg-surface p-5 shadow-sm" aria-label="Organisation details">
          <h2 className="font-heading text-xl text-ink">{org.name}</h2>
          <p className="capitalize">{org.type}</p>
          {org.email ? <p>{org.email}</p> : null}
          {org.phone ? <p>{org.phone}</p> : null}
          <p className="text-sm text-slate">You are a member. Only the organisation owner can edit these details.</p>
        </section>
      ) : (
        <OrganisationForm values={{ name: org?.name ?? "", type: org?.type ?? "business", email: org?.email ?? actor.email, phone: org?.phone ?? actor.phone ?? "" }} />
      )}
    </main>
  );
}
