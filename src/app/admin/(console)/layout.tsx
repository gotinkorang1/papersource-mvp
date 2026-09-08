import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { isDatabaseConfigured } from "@/lib/db/client";
import { requireStaff } from "@/lib/staff/require";
import { notFound } from "next/navigation";

export const metadata = {
  manifest: "/admin/manifest.webmanifest",
  applicationName: "PaperSource Operations",
  title: {
    default: "Operations",
    template: "%s · PaperSource Operations",
  },
};

// Admin pages depend on the request's Supabase session and must never be
// prerendered during a deployment build.
export const dynamic = "force-dynamic";

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
    <div className="admin-shell flex min-h-[100svh] flex-col bg-background text-ink md:flex-row">
      <AdminSidebar actor={actor} />
      <div className="min-w-0 flex-1 px-4 pb-8 pt-20 sm:px-6 sm:pb-10 sm:pt-20 md:px-8 md:py-8 lg:px-10">{children}</div>
    </div>
  );
}
