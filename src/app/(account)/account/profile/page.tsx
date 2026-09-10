import type { Metadata } from "next";
import { ProfileForm } from "@/components/account/profile-form";
import { requireCustomer } from "@/lib/customer/require";

export const metadata: Metadata = { title: "Profile", robots: { index: false, follow: false } };

export default async function AccountProfilePage() {
  const actor = await requireCustomer("/account/profile");
  return (
    <main>
      <h1 className="text-3xl text-ink">Your profile</h1>
      <p className="mt-3 max-w-xl text-slate">Keep your contact details current so checkout, delivery updates, and quotations stay accurate.</p>
      <ProfileForm fullName={actor.fullName} phone={actor.phone ?? ""} />
    </main>
  );
}
