import type { ReactNode } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { requireCustomer } from "@/lib/customer/require";

export default async function AccountSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireCustomer();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <AccountNav />
      <div className="mt-8">{children}</div>
    </div>
  );
}
