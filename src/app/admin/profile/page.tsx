import type { Metadata } from "next";
import { requireStaff } from "@/lib/staff/require";

export const metadata: Metadata = { title: "My staff profile" };
export const dynamic = "force-dynamic";

export default async function AdminProfilePage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string }> }) {
  const actor = await requireStaff();
  const { error, success } = await searchParams;
  return (
    <main className="max-w-2xl">
      <p className="text-sm tracking-[0.16em] text-slate uppercase">Account</p>
      <h1 className="mt-2 font-heading text-3xl text-ink">My staff profile</h1>
      <p className="mt-3 text-slate">Keep your contact details current. Your role and work email are managed by an administrator.</p>
      {error ? <p role="alert" className="mt-5 rounded-lg border border-error/40 bg-card px-4 py-3 text-sm text-error">{error}</p> : null}
      {success ? <p role="status" className="mt-5 rounded-lg border border-paper-green/40 bg-paper-green/10 px-4 py-3 text-sm text-paper-green">{success === "password" ? "Password updated successfully." : "Profile updated successfully."}</p> : null}
      <form action="/admin/profile/mutate" method="post" className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-5">
        <input type="hidden" name="intent" value="profile" />
        <label className="grid gap-1 text-sm font-medium text-ink">Work email<input value={actor.email} readOnly className="h-11 rounded-lg border border-border bg-muted/40 px-3 text-slate" /></label>
        <label className="grid gap-1 text-sm font-medium text-ink">Full name<input name="fullName" required minLength={2} maxLength={120} defaultValue={actor.fullName} className="h-11 rounded-lg border border-border bg-background px-3 text-ink" /></label>
        <label className="grid gap-1 text-sm font-medium text-ink">Phone (optional)<input name="phone" type="tel" maxLength={30} defaultValue={actor.phone ?? ""} className="h-11 rounded-lg border border-border bg-background px-3 text-ink" /></label>
        <button type="submit" className="h-11 w-fit rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">Save profile</button>
      </form>
      <form action="/admin/profile/mutate" method="post" className="mt-6 grid gap-4 rounded-xl border border-border bg-card p-5">
        <input type="hidden" name="intent" value="password" />
        <div><h2 className="text-lg font-semibold text-ink">Change password</h2><p className="mt-1 text-sm text-slate">Use at least 12 characters. You may be asked to sign in again.</p></div>
        <label className="grid gap-1 text-sm font-medium text-ink">New password<input name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" className="h-11 rounded-lg border border-border bg-background px-3 text-ink" /></label>
        <label className="grid gap-1 text-sm font-medium text-ink">Confirm new password<input name="confirmPassword" type="password" required minLength={12} maxLength={128} autoComplete="new-password" className="h-11 rounded-lg border border-border bg-background px-3 text-ink" /></label>
        <button type="submit" className="h-11 w-fit rounded-lg border border-ink px-5 text-sm font-semibold text-ink transition hover:bg-muted">Update password</button>
      </form>
    </main>
  );
}
