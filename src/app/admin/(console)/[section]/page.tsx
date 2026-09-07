import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ADMIN_PLACEHOLDER_SECTIONS } from "@/components/admin/nav";
import { requireStaff } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Admin",
};

type PageProps = {
  params: Promise<{ section: string }>;
};

const TITLES: Record<string, string> = {
  customers: "Customers",
  organisations: "Organisations",
  promotions: "Promotions",
  banners: "Banners",
  featured: "Featured products",
  deliveries: "Deliveries",
  payments: "Payments",
  enquiries: "Enquiries",
  pages: "Pages",
  faqs: "FAQs",
  navigation: "Navigation",
  users: "Users",
  roles: "Roles",
  logs: "Logs",
  settings: "Settings",
  delivery: "Delivery zones",
};

export default async function AdminPlaceholderPage({ params }: PageProps) {
  await requireStaff();
  const { section } = await params;
  if (!ADMIN_PLACEHOLDER_SECTIONS.includes(section as (typeof ADMIN_PLACEHOLDER_SECTIONS)[number])) {
    notFound();
  }

  return (
    <main>
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Admin desk</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">
        {TITLES[section] ?? section}
      </h1>
      <span className="mt-4 inline-flex rounded-full border border-ochre/40 bg-ochre/10 px-3 py-1 text-xs font-semibold tracking-[0.12em] text-ink uppercase">
        Planned
      </span>
      <p className="mt-4 max-w-xl text-slate">
        This desk is visible in the admin navigation while its workflow is being prepared.
        It is not available for live operations yet.
      </p>
      <Link href="/admin" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        Back to dashboard
      </Link>
    </main>
  );
}
