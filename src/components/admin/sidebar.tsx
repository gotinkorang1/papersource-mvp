"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { paperButton } from "@/components/commerce/paper-button";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { canAccessAdmin } from "@/lib/staff/rbac";
import type { StaffActor } from "@/lib/staff/types";
import { ADMIN_NAV } from "./nav";

export function AdminSidebar({ actor }: { actor: StaffActor }) {
  const pathname = usePathname();
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    activeLinkRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    setNavOpen(false);
  }, [pathname]);

  return (
    <>
      <button type="button" aria-expanded={accountOpen} aria-controls="admin-account-panel" onClick={() => setAccountOpen((open) => !open)} className="fixed right-4 top-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:right-6">
        <span className="flex size-7 items-center justify-center rounded-full bg-ink text-[0.65rem] font-bold tracking-[0.12em] text-cream" aria-hidden="true">PS</span>
        <span className="hidden sm:inline">Administrator</span>
        <span className="text-xs" aria-hidden="true">{accountOpen ? "×" : "⌄"}</span>
      </button>
      <div className={`fixed inset-0 z-40 bg-ink/30 transition-opacity ${accountOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden="true" onClick={() => setAccountOpen(false)} />
      <section id="admin-account-panel" aria-label="Staff account" aria-hidden={!accountOpen} inert={!accountOpen} className={`fixed inset-y-0 right-0 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col border-l border-border bg-card p-6 text-ink shadow-2xl transition-transform duration-300 ease-out ${accountOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate">Signed in as</p><p className="mt-2 font-heading text-xl">{actor.fullName}</p><p className="mt-1 text-sm capitalize text-slate">{actor.role.replaceAll("_", " ")}</p></div><button type="button" aria-label="Close account panel" onClick={() => setAccountOpen(false)} className="min-h-11 min-w-11 rounded-md text-2xl text-slate hover:bg-muted hover:text-ink">×</button></div>
        <div className="mt-auto border-t border-border pt-5"><Link href="/admin/profile" onClick={() => setAccountOpen(false)} className="inline-flex min-h-11 w-full items-center rounded-md px-3 text-sm font-semibold text-ink underline underline-offset-4 hover:bg-muted">My profile</Link><form action="/admin/logout" method="post" className="mt-2"><SubmitProgressButton idleLabel="Sign out" pendingLabel="Signing out…" className={`${paperButton({ variant: "ghost" })} min-h-11 w-full justify-start px-3 text-ink`} /></form></div>
      </section>
      <aside className="sticky top-0 z-20 flex max-h-[calc(100svh-4.5rem)] w-full shrink-0 flex-col bg-sidebar text-sidebar-foreground shadow-sm md:h-[100svh] md:max-h-none md:w-64 md:shadow-none">
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3 sm:px-5 sm:py-4">
        <Link href="/admin" aria-label="PaperSource admin dashboard" className="inline-flex size-10 items-center justify-center rounded-md border-2 border-ochre bg-cream font-heading text-sm font-bold tracking-[0.12em] text-ink shadow-[2px_2px_0_#e6a329] transition-transform hover:-translate-y-0.5 md:size-11">PS</Link>
        <button type="button" aria-expanded={navOpen} aria-controls="admin-navigation" onClick={() => setNavOpen((open) => !open)} className="inline-flex min-h-11 items-center gap-2 rounded-md border border-sidebar-border px-3 text-sm font-semibold text-sidebar-foreground transition hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring md:hidden"><span>{navOpen ? "Close" : "Menu"}</span><span aria-hidden="true">{navOpen ? "×" : "☰"}</span></button>
      </div>
      <nav id="admin-navigation" className={`${navOpen ? "max-h-[calc(100svh-8rem)] opacity-100" : "max-h-0 overflow-hidden opacity-0 md:max-h-none md:opacity-100"} flex min-h-0 flex-1 snap-x snap-mandatory scroll-smooth gap-4 overflow-x-auto overflow-y-auto overscroll-contain px-3 py-3 transition-[max-height,opacity] duration-300 [scrollbar-width:thin] md:block md:space-y-6 md:overflow-x-hidden md:px-3 md:py-5`} aria-label="Admin">
        {ADMIN_NAV.map((group) => {
          if ("href" in group) {
            if (!canAccessAdmin(actor.role, group.area, "read")) {
              return null;
            }
            const current = pathname === group.href;
            return (
              <Link
                key={group.href}
                href={group.href}
                ref={current ? activeLinkRef : undefined}
                className={`flex min-h-11 snap-start items-center rounded-md px-3 py-2 text-sm md:min-h-0 ${ 
                  current ? "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-sidebar-ring/50" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70"
                }`}
                aria-current={current ? "page" : undefined}
              >
                {group.label}
              </Link>
            );
          }

          const items = group.items.filter((item) =>
            canAccessAdmin(actor.role, item.area, "read"),
          );
          if (items.length === 0) {
            return null;
          }

          return (
            <div key={group.label} className="min-w-max">
              <p className="hidden px-3 text-[0.7rem] tracking-[0.16em] text-sidebar-foreground/45 uppercase md:block">
                {group.label}
              </p>
              <ul className="mt-2 flex gap-1 md:block md:space-y-0.5">
                {items.map((item) => {
                  const current =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        ref={current ? activeLinkRef : undefined}
                        className={`flex min-h-11 snap-start items-center rounded-md px-3 py-2 text-sm whitespace-nowrap md:min-h-0 md:py-1.5 ${ 
                          current
                            ? "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-sidebar-ring/50"
                            : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70"
                        }`}
                        aria-current={current ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
    </>
  );
}
