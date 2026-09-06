"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteLinks() {
  const pathname = usePathname();
  return (
    <>
      {(["/about", "/contact"] as const).map((href) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`border-b-2 text-sm font-medium transition-[color,border-color] hover:border-ochre hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${active ? "border-ochre text-ink" : "border-transparent text-graphite"}`}>{href.slice(1) === "about" ? "About" : "Contact"}</Link>;
      })}
    </>
  );
}
