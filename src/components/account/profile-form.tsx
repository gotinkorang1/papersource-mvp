"use client";

import { useActionState } from "react";
import { saveCustomerProfileAction } from "@/features/account/actions";
import type { AccountActionState } from "@/features/account/actions-state";

export function ProfileForm({ fullName, phone }: { fullName: string; phone: string }) {
  const [state, action, pending] = useActionState(saveCustomerProfileAction, {} as AccountActionState);
  const error = (field: string) => state.errors?.[field]?.join(" ");
  return (
    <form action={action} className="mt-8 grid max-w-xl gap-5 rounded-xl border border-border bg-surface p-5 shadow-sm" aria-busy={pending}>
      <div className="space-y-1.5">
        <label htmlFor="profile-name" className="block text-sm font-medium text-ink">Full name</label>
        <input id="profile-name" name="fullName" required maxLength={160} autoComplete="name" defaultValue={fullName} aria-invalid={Boolean(error("fullName"))} aria-describedby={error("fullName") ? "profile-name-error" : undefined} className="min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-ink outline-none transition focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20" />
        {error("fullName") ? <p id="profile-name-error" className="text-sm text-error">{error("fullName")}</p> : null}
      </div>
      <div className="space-y-1.5">
        <label htmlFor="profile-phone" className="block text-sm font-medium text-ink">Phone number</label>
        <input id="profile-phone" name="phone" type="tel" inputMode="tel" maxLength={30} autoComplete="tel" defaultValue={phone} aria-invalid={Boolean(error("phone"))} aria-describedby={error("phone") ? "profile-phone-error" : undefined} className="min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-ink outline-none transition focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20" />
        {error("phone") ? <p id="profile-phone-error" className="text-sm text-error">{error("phone")}</p> : null}
      </div>
      <p className="text-sm text-slate">Email is managed through your sign-in provider and cannot be changed here.</p>
      {state.message ? <p role={state.success ? "status" : "alert"} className={state.success ? "text-sm text-paper-green" : "text-sm text-error"}>{state.message}</p> : null}
      <button type="submit" disabled={pending} className="min-h-11 rounded-lg bg-ink px-5 py-2.5 font-medium text-cream transition hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Saving…" : "Save profile"}</button>
    </form>
  );
}
