"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { shopMegaColumns } from "@/features/catalogue/local-data";

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
        className="text-sm text-graphite hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        aria-expanded={open}
        aria-controls={menuId}
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
          className="absolute top-full left-0 z-30 mt-3 w-[min(36rem,calc(100vw-2rem))] border border-border bg-card p-6 shadow-md"
        >
          <p className="text-xs tracking-[0.16em] text-slate uppercase">Shop</p>
          <div className="mt-4 grid grid-cols-2 gap-8">
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
