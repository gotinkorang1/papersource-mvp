"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type ManagedLink = { id?: string; label: string; href: string };

export function ManagedNavLinks({ links }: { links: ReadonlyArray<ManagedLink> }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.id ?? link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`border-b-2 text-sm font-medium transition-[color,border-color] hover:border-ochre hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${active ? "border-ochre text-ink" : "border-transparent text-graphite"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
