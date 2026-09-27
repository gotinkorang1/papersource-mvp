import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CustomerAuthForm } from "@/components/account/auth-form";
import { readCustomerActor } from "@/lib/customer/require";
import { safeCustomerReturnPath } from "@/lib/customer/return-path";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const next = safeCustomerReturnPath((await searchParams).next);
  const actor = await readCustomerActor();
  if (actor) {
    redirect(next);
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <div className="rounded-3xl border border-border bg-muted/30 p-6 sm:p-9">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-paper-green">Set up your workspace</p>
      <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-ink">Create account</h1>
      <p className="mt-3 text-slate">
        Save your details and keep track of orders and quotations. Your current cart and quote list stay separate and join your account when you sign in.
      </p>
      <CustomerAuthForm mode="register" next={next} />
      <p className="mt-6 text-sm text-slate">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="underline">
          Sign in
        </Link>
      </p>
      <p className="mt-3 text-sm text-ink"><Link href="/forgot-password" className="underline">Request a password reset</Link></p>
      </div>
    </main>
  );
}
