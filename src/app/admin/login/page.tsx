import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StaffLoginForm } from "@/components/admin/login-form";
import { Wordmark } from "@/components/marketing/wordmark";
import { isDatabaseConfigured } from "@/lib/db/client";
import { readStaffActor } from "@/lib/staff/require";

export const metadata: Metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  if (isDatabaseConfigured()) {
    const actor = await readStaffActor();
    if (actor) {
      redirect("/admin");
    }
  }

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4 py-10 sm:py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[var(--ps-shadow-md)] sm:p-8">
        <Wordmark shrinkOnScroll={false} />
        <h1 className="mt-2 font-heading text-2xl text-ink">Staff sign in</h1>
        <p className="mt-3 text-sm text-slate">
          Sign in with your PaperSource Supabase account. Access is granted only
          to profiles assigned an entry in <code>admin_roles</code>.
        </p>
        <div className="mt-6">
          <StaffLoginForm error={error} />
        </div>
      </div>
    </main>
  );
}
