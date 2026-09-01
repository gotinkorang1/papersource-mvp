import type { Metadata } from "next";
import Link from "next/link";
import { CustomerAuthForm } from "@/components/account/auth-form";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false, follow: false } };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ authError?: string }> }) {
  const { authError } = await searchParams;
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl text-ink">Reset your password</h1>
      <p className="mt-3 text-slate">Enter your email and we’ll send a link to choose a new password.</p>
      {authError === "confirmation" ? <p role="alert" className="mt-4 rounded-md border border-error/40 bg-white p-4 text-sm text-error">This reset link is invalid or expired. Request a new link below.</p> : null}
      <CustomerAuthForm mode="forgot" />
      <p className="mt-6 text-sm text-ink"><Link href="/login" className="underline">Back to sign in</Link></p>
    </main>
  );
}
