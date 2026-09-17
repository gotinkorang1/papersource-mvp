"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { mobileMenuLinks, isNavigationLinkActive } from "./navigation-model";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => {
      menuRef.current?.querySelector<HTMLElement>("a[href], button:not([disabled])")?.focus();
    }, 0);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const focusable = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
      trigger?.focus();
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        ref={triggerRef}
        className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border text-ink transition-[background-color,border-color,color,transform] hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:scale-95 ${open ? "border-ochre bg-cream text-ink" : "border-border"}`}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
      </button>
      {open ? (
        <>
          <button type="button" aria-label="Close menu overlay" className="fixed inset-0 z-40 cursor-default bg-ink/30 backdrop-blur-[1px] motion-safe:animate-in motion-safe:fade-in-0 lg:hidden" onClick={() => setOpen(false)} />
          <div ref={menuRef} id={menuId} role="dialog" aria-modal="true" aria-label="Menu" className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-8.5rem)] overflow-y-auto border-t border-border bg-card px-4 py-4 shadow-[0_18px_40px_rgba(16,42,67,0.12)] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1 sm:px-6">
            <div className="grid gap-2 sm:grid-cols-2">
            <Link href="/shop" className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink/90" onClick={() => setOpen(false)}>
              Shop all products
            </Link>
            <Link href="/request-quote" className="rounded-md border border-ink px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-cream" onClick={() => setOpen(false)}>
              Request a quote
            </Link>
            </div>
            <div className="mt-4 grid gap-1 border-t border-border pt-3 sm:grid-cols-2">
            {mobileMenuLinks.map((link) => {
              const active = isNavigationLinkActive(link.href, pathname);
              return (
                <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`rounded-md border-l-2 px-3 py-2.5 text-sm transition-[color,background-color,border-color] hover:bg-cream hover:text-ink ${active ? "border-ochre bg-cream/50 font-semibold text-ink" : "border-transparent text-graphite"}`} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              );
            })}
            </div>
            <div className="mt-3 border-t border-border pt-3">
            <p className="px-3 text-xs tracking-[0.14em] text-slate uppercase">Shop by need</p>
            <div className="mt-1 grid gap-1 sm:grid-cols-2">
              <Link href="/schools" className="rounded-md px-3 py-2.5 text-sm text-graphite hover:bg-cream hover:text-ink" onClick={() => setOpen(false)}>Schools</Link>
              <Link href="/business" className="rounded-md px-3 py-2.5 text-sm text-graphite hover:bg-cream hover:text-ink" onClick={() => setOpen(false)}>Business accounts</Link>
            </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
