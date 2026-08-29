"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { paperButton } from "@/components/commerce/paper-button";
import { canAccessAdmin } from "@/lib/staff/rbac";
import type { StaffActor } from "@/lib/staff/types";
import { ADMIN_NAV } from "./nav";

export function AdminSidebar({ actor }: { actor: StaffActor }) {
  const pathname = usePathname();
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-ink text-white">
      <div className="border-b border-white/10 px-5 py-6">
        <p className="text-xs tracking-[0.16em] text-white/60 uppercase">
          PaperSource
        </p>
        <p className="mt-1 font-heading text-lg">Operations</p>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Admin">
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
                className={`block rounded-md px-3 py-2 text-sm ${
                  current ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10"
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
            <div key={group.label}>
              <p className="px-3 text-[0.7rem] tracking-[0.16em] text-white/45 uppercase">
                {group.label}
              </p>
              <ul className="mt-2 space-y-0.5">
                {items.map((item) => {
                  const current =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block rounded-md px-3 py-1.5 text-sm ${
                          current
                            ? "bg-white/15 text-white"
                            : "text-white/75 hover:bg-white/10"
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
      <div className="border-t border-white/10 px-4 py-4 text-sm">
        <p className="text-white/80">{actor.fullName}</p>
        <p className="text-xs text-white/50">{actor.role.replaceAll("_", " ")}</p>
        <form action="/admin/logout" method="post" className="mt-3">
          <button type="submit" className={`${paperButton({ variant: "ghost" })} px-0 text-white`}>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
