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
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <AccountNav />
      <div className="mt-8">{children}</div>
    </div>
  );
}
