import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { isDatabaseConfigured } from "@/lib/db/client";
import { requireStaff } from "@/lib/staff/require";
import { notFound } from "next/navigation";

export default async function AdminConsoleLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!isDatabaseConfigured()) {
    notFound();
  }

  const actor = await requireStaff();

  return (
    <div className="flex min-h-full bg-cream">
      <AdminSidebar actor={actor} />
      <div className="min-w-0 flex-1 px-6 py-8 text-graphite">{children}</div>
    </div>
  );
}
