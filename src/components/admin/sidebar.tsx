"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { paperButton } from "@/components/commerce/paper-button";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { Wordmark } from "@/components/marketing/wordmark";
import { canAccessAdmin } from "@/lib/staff/rbac";
import type { StaffActor } from "@/lib/staff/types";
import { ADMIN_NAV } from "./nav";

export function AdminSidebar({ actor }: { actor: StaffActor }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 z-20 flex max-h-[18rem] w-full shrink-0 flex-col bg-sidebar text-sidebar-foreground shadow-sm md:h-screen md:max-h-none md:w-64 md:shadow-none">
      <div className="border-b border-sidebar-border px-4 py-4 sm:px-5 sm:py-6">
        <Wordmark href="/admin" inverted shrinkOnScroll={false} className="max-w-fit" />
        <p className="mt-1 font-heading text-lg">Operations</p>
      </div>
      <nav className="flex min-h-0 flex-1 gap-4 overflow-x-auto overflow-y-auto overscroll-contain px-3 py-3 [scrollbar-width:thin] md:block md:space-y-6 md:overflow-x-hidden md:px-3 md:py-5" aria-label="Admin">
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
                className={`flex min-h-11 items-center rounded-md px-3 py-2 text-sm md:min-h-0 ${
                  current ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70"
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
                        className={`flex min-h-11 items-center rounded-md px-3 py-2 text-sm whitespace-nowrap md:min-h-0 md:py-1.5 ${
                          current
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
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
      <div className="border-t border-sidebar-border px-4 py-4 text-sm">
        <p className="text-sidebar-foreground/80">{actor.fullName}</p>
        <p className="text-xs text-sidebar-foreground/50">{actor.role.replaceAll("_", " ")}</p>
        <form action="/admin/logout" method="post" className="mt-3">
          <SubmitProgressButton
            idleLabel="Sign out"
            pendingLabel="Signing out…"
            className={`${paperButton({ variant: "ghost" })} px-0 text-sidebar-foreground`}
          />
        </form>
      </div>
    </aside>
  );
}
