import type { Metadata } from "next";
import Link from "next/link";
import { CustomerAuthForm } from "@/components/account/auth-form";
import { readCustomerActor } from "@/lib/customer/require";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false } };

export default async function ResetPasswordPage() {
  const actor = await readCustomerActor();
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl text-ink">Choose a new password</h1>
      {actor ? <><p className="mt-3 text-slate">Choose a strong password you do not use elsewhere.</p><CustomerAuthForm mode="reset" /></> : <p role="alert" className="mt-4 text-slate">Open the latest reset link from your email before choosing a new password.</p>}
      <p className="mt-6 text-sm text-ink"><Link href="/forgot-password" className="underline">Request a new reset link</Link></p>
    </main>
  );
}
