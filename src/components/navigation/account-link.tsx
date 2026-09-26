import Link from "next/link";
import { readCustomerActor } from "@/lib/customer/require";
import { isDatabaseConfigured } from "@/lib/db/client";

export async function AccountLink() {
  const accountLinkClass = "hidden min-h-11 items-center rounded-md px-2 text-sm text-graphite hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:inline-flex";
  if (!isDatabaseConfigured()) {
    return (
      <Link href="/login" className={accountLinkClass}>
        Sign in
      </Link>
    );
  }
  const actor = await readCustomerActor();
  if (actor) {
    return (
      <Link href="/account" className={accountLinkClass}>
        {actor.fullName}
      </Link>
    );
  }
  return (
    <Link href="/login" className={accountLinkClass}>
      Sign in
    </Link>
  );
}
