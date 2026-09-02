"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { shopMegaColumns } from "@/features/catalogue/local-data";

const shopTools = [
  ["Brands", "/brands"],
  ["Bulk orders", "/bulk-orders"],
  ["Quick order", "/quick-order"],
] as const;

export function ShopMegaMenu() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="min-h-11 text-sm text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        Shop
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-full left-0 z-30 w-[min(36rem,calc(100vw-2rem))] rounded-lg border border-border bg-card p-6 pt-5 shadow-lg motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95"
        >
          <p className="text-xs tracking-[0.16em] text-slate uppercase">Shop</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            {shopMegaColumns.map((column) => (
              <div key={column.title}>
                <p className="text-sm font-medium text-ink">{column.title}</p>
                <ul className="mt-2 space-y-1">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        role="menuitem"
                        className="text-sm text-slate hover:text-ink"
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="text-sm font-medium text-ink">Ways to shop</p>
              <ul className="mt-2 space-y-1">
                {shopTools.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} role="menuitem" className="text-sm text-slate transition-colors hover:text-ink" onClick={() => setOpen(false)}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
