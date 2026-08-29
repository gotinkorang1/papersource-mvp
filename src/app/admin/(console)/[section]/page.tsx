import type { Metadata } from "next";
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
  products: "Products",
  categories: "Categories",
  brands: "Brands",
  inventory: "Inventory",
  pricing: "Pricing",
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
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Coming next</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">
        {TITLES[section] ?? section}
      </h1>
      <p className="mt-4 max-w-xl text-slate">
        This desk is in the admin tree so staff never need Supabase Studio.
        Quote review and orders are live; this section is not operational yet.
      </p>
    </main>
  );
}
