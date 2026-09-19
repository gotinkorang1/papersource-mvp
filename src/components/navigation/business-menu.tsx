"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

export function BusinessMenu() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const currentPathname = pathname ?? "";
  const active = ["/business", "/schools", "/corporate-accounts"].some(
    (href) => currentPathname === href || currentPathname.startsWith(`${href}/`),
  );
  return (
    <div className="group relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}>
      <button ref={triggerRef} type="button" className={`inline-flex min-h-11 items-center gap-1 border-b-2 text-sm font-medium transition-[color,border-color] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${active || open ? "border-ochre text-ink" : "border-transparent text-graphite"}`} aria-expanded={open} aria-controls={menuId} aria-haspopup="menu" onClick={() => setOpen((value) => !value)} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); event.currentTarget.focus(); setOpen(false); } else if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); window.setTimeout(() => menuRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus(), 0); } }}>
        Business <ChevronDown className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open ? (
        <div ref={menuRef} id={menuId} role="menu" onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); triggerRef.current?.focus(); setOpen(false); } }} className="absolute top-[calc(100%-0.15rem)] left-0 z-30 min-w-56 origin-top rounded-2xl border border-border/80 bg-card p-4 pt-5 shadow-[0_18px_44px_rgba(16,42,67,0.14)] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1">
          <p className="text-xs tracking-[0.16em] text-slate uppercase">For organisations</p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/business" role="menuitem" className="block rounded-md px-2 py-1.5 text-sm text-slate transition-colors hover:bg-cream hover:text-ink" onClick={() => setOpen(false)}>Business accounts</Link></li>
            <li><Link href="/schools" role="menuitem" className="block rounded-md px-2 py-1.5 text-sm text-slate transition-colors hover:bg-cream hover:text-ink" onClick={() => setOpen(false)}>Schools</Link></li>
            <li><Link href="/corporate-accounts" role="menuitem" className="block rounded-md px-2 py-1.5 text-sm text-slate transition-colors hover:bg-cream hover:text-ink" onClick={() => setOpen(false)}>Corporate accounts</Link></li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
