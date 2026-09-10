"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/quotes", label: "Quotes" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/organisation", label: "Organisation" },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname === link.href ? "page" : undefined}
          className={`min-h-10 shrink-0 rounded-full border px-4 py-2 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${pathname === link.href ? "border-ink bg-ink text-cream" : "border-border bg-surface text-ink hover:border-ink"}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
