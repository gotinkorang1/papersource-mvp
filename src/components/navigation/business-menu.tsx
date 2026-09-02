"use client";

import { useId, useState } from "react";
import Link from "next/link";

export function BusinessMenu() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" className="text-sm text-graphite hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((value) => !value)} onKeyDown={(event) => event.key === "Escape" && setOpen(false)}>
        Business
      </button>
      {open ? (
        <div id={menuId} role="menu" className="absolute top-full left-0 z-30 mt-3 min-w-52 border border-border bg-card p-4 shadow-md">
          <p className="text-xs tracking-[0.16em] text-slate uppercase">For organisations</p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/business" role="menuitem" className="block text-sm text-slate hover:text-ink" onClick={() => setOpen(false)}>Business accounts</Link></li>
            <li><Link href="/schools" role="menuitem" className="block text-sm text-slate hover:text-ink" onClick={() => setOpen(false)}>Schools</Link></li>
            <li><Link href="/corporate-accounts" role="menuitem" className="block text-sm text-slate hover:text-ink" onClick={() => setOpen(false)}>Corporate accounts</Link></li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
