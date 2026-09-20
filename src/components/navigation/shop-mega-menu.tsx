"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ShopMenuColumn } from "./shop-menu-model";
import { isNavigationLinkActive } from "./navigation-model";

const shopTools = [
  ["Brands", "/brands"],
  ["Bulk orders", "/bulk-orders"],
  ["Quick order", "/quick-order"],
] as const;

export function ShopMegaMenu({ columns }: { columns: ShopMenuColumn[] }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const active = ["/shop", "/product", "/brands", "/bulk-orders", "/quick-order"].some(
    (href) => isNavigationLinkActive(href, pathname),
  );

  return (
    <div
      className="group relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        type="button"
        id={`${menuId}-trigger`}
        ref={triggerRef}
        className={`inline-flex min-h-11 items-center gap-1 border-b-2 text-sm font-medium transition-[color,border-color] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${active ? "border-ochre text-ink" : "border-transparent text-graphite"}`}
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.currentTarget.focus();
            setOpen(false);
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            window.setTimeout(() => menuRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus(), 0);
          }
        }}
      >
        Shop <ChevronDown className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          aria-labelledby={`${menuId}-trigger`}
          role="menu"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              triggerRef.current?.focus();
              setOpen(false);
              return;
            }
            if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
            const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
            if (!items.length) return;
            event.preventDefault();
            const currentIndex = items.indexOf(document.activeElement as HTMLElement);
            const nextIndex = event.key === "Home"
              ? 0
              : event.key === "End"
                ? items.length - 1
                : currentIndex < 0
                  ? (event.key === "ArrowUp" ? items.length - 1 : 0)
                  : (currentIndex + (event.key === "ArrowUp" ? -1 : 1) + items.length) % items.length;
            items[nextIndex]?.focus();
          }}
          className="absolute top-[calc(100%-0.15rem)] left-0 z-30 w-[min(36rem,calc(100vw-2rem))] rounded-2xl border border-border/80 bg-card p-6 pt-5 shadow-[0_18px_44px_rgba(16,42,67,0.14)] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1"
        >
          <p className="text-xs tracking-[0.16em] text-slate uppercase">Shop</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="text-sm font-medium text-ink">{column.title}</p>
                <ul className="mt-2 space-y-1">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        role="menuitem"
                        aria-current={isNavigationLinkActive(link.href, pathname) ? "page" : undefined}
                        className="block rounded-md px-2 py-1.5 text-sm text-slate transition-colors hover:bg-cream hover:text-ink"
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
                    <Link href={href} role="menuitem" aria-current={isNavigationLinkActive(href, pathname) ? "page" : undefined} className="block rounded-md px-2 py-1.5 text-sm text-slate transition-colors hover:bg-cream hover:text-ink" onClick={() => setOpen(false)}>
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
