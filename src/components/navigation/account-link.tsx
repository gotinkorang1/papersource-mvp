import Link from "next/link";
import { readCustomerActor } from "@/lib/customer/require";
import { isDatabaseConfigured } from "@/lib/db/client";

export async function AccountLink() {
  if (!isDatabaseConfigured()) {
    return (
      <Link href="/login" className="hidden text-sm text-graphite hover:text-ink lg:inline">
        Sign in
      </Link>
    );
  }
  const actor = await readCustomerActor();
  if (actor) {
    return (
      <Link href="/account" className="hidden text-sm text-graphite hover:text-ink lg:inline">
        {actor.fullName}
      </Link>
    );
  }
  return (
    <Link href="/login" className="hidden text-sm text-graphite hover:text-ink lg:inline">
      Sign in
    </Link>
  );
}
