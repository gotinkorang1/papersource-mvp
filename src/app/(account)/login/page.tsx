import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CustomerAuthForm } from "@/components/account/auth-form";
import { readCustomerActor } from "@/lib/customer/require";
import { safeCustomerReturnPath } from "@/lib/customer/return-path";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ next?: string; authError?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const next = safeCustomerReturnPath(params.next);
  const actor = await readCustomerActor();
  if (actor) {
    redirect(next);
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <div className="rounded-3xl border border-border bg-muted/30 p-6 sm:p-9">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-paper-green">Your PaperSource account</p>
      <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-ink">Sign in</h1>
      <p className="mt-3 text-slate">
        Saved addresses, orders and quotations. Guest checkout still works
        without an account.
      </p>
      {params.authError === "confirmation" ? (
        <p role="alert" className="mt-4 rounded-md border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          This link is invalid or expired. Sign in if you have already confirmed your email, or request a password reset below.
        </p>
      ) : null}
      {params.authError === "oauth" ? (
        <p role="alert" className="mt-4 rounded-md border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          Social sign-in was cancelled or is temporarily unavailable. Try again, or use email sign-in instead.
        </p>
      ) : null}
      {params.authError === "service" ? (
        <p role="alert" className="mt-4 rounded-md border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
          Account services are temporarily unavailable. Please try again in a moment, or use guest checkout.
        </p>
      ) : null}
      <CustomerAuthForm mode="login" next={next} />
      <p className="mt-4 text-sm text-ink"><Link href="/forgot-password" className="underline">Forgot password?</Link></p>
      <p className="mt-6 text-sm text-slate">
        New here?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="underline">
          Create an account
        </Link>
      </p>
      </div>
    </main>
  );
}
