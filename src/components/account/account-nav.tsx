import Link from "next/link";

const LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/quotes", label: "Quotes" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/organisation", label: "Organisation" },
];

export function AccountNav() {
  return (
    <nav aria-label="Account" className="flex flex-wrap gap-4 text-sm">
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="text-ink underline">
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
