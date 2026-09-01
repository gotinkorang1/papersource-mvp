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
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl text-ink">Create account</h1>
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
    </main>
  );
}
