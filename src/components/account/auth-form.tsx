"use client";

import { useActionState } from "react";
import { useState } from "react";
import Link from "next/link";
import { paperButton } from "@/components/commerce/paper-button";
import { loginCustomerAction, registerCustomerAction, requestPasswordResetAction, updateCustomerPasswordAction } from "@/features/account/auth-actions";
import type { CustomerAuthFormState } from "@/features/account/auth-actions-state";
import { safeCustomerReturnPath } from "@/lib/customer/return-path";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "login" | "register" | "forgot" | "reset";
const actions = { login: loginCustomerAction, register: registerCustomerAction, forgot: requestPasswordResetAction, reset: updateCustomerPasswordAction };
const labels = { login: "Sign in", register: "Create account", forgot: "Send reset link", reset: "Update password" };
const pendingLabels = { login: "Signing in…", register: "Creating account…", forgot: "Sending…", reset: "Updating password…" };
const initialState: CustomerAuthFormState = {};
const socialProviders = [
  { provider: "google", label: "Continue with Google", mark: "G" },
  { provider: "facebook", label: "Continue with Facebook", mark: "f" },
  { provider: "azure", label: "Continue with Microsoft", mark: "M" },
] as const;

export function CustomerAuthForm({ mode, next }: { mode: Mode; next?: string }) {
  const [state, formAction, pending] = useActionState(actions[mode], initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [socialPending, setSocialPending] = useState<string | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);
  const fields = [
    ...(mode === "register" ? [
      { name: "fullName", label: "Full name", type: "text", autoComplete: "name", required: true, maxLength: 120 },
      { name: "phone", label: "Phone (optional)", type: "tel", autoComplete: "tel", required: false, maxLength: 30 },
    ] : []),
    ...(mode !== "reset" ? [{ name: "email", label: "Email", type: "email", autoComplete: mode === "login" ? "username" : "email", required: true, maxLength: 254 }] : []),
    ...(mode !== "forgot" ? [{ name: "password", label: "Password", type: "password", autoComplete: mode === "login" ? "current-password" : "new-password", required: true, minLength: mode === "login" ? undefined : 12, maxLength: 128 }] : []),
    ...(mode === "reset" ? [{ name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password", required: true, minLength: 12, maxLength: 128 }] : []),
  ];

  async function signInWithProvider(provider: (typeof socialProviders)[number]["provider"]) {
    if (pending || socialPending) return;
    setSocialPending(provider);
    setSocialError(null);
    try {
      const client = createSupabaseBrowserClient();
      const callback = new URL("/auth/confirm", window.location.origin);
      callback.searchParams.set("next", safeCustomerReturnPath(next));
      const { error } = await client.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callback.toString() },
      });
      if (error) setSocialError(`${provider === "azure" ? "Microsoft" : provider[0].toUpperCase() + provider.slice(1)} sign-in is unavailable right now. Try email sign-in instead.`);
    } catch {
      setSocialError("Social sign-in is unavailable right now. Try email sign-in instead.");
    } finally {
      setSocialPending(null);
    }
  }

  return (
    <form action={formAction} className="mt-8 grid gap-4" aria-label={labels[mode]} aria-busy={pending}>
      <input type="hidden" name="next" value={safeCustomerReturnPath(next)} />
      {state.message ? (
        <p role={state.status === "error" ? "alert" : "status"} className={`rounded-md border bg-surface px-4 py-3 text-sm ${state.status === "error" ? "border-error/40 text-error" : "border-paper-green/40 text-paper-green"}`}>
          {state.message}
        </p>
      ) : null}
      {(mode === "login" || mode === "register") ? (
        <>
          <div className="grid gap-2" aria-label="Social sign-in options">
            {socialProviders.map(({ provider, label, mark }) => (
              <button key={provider} type="button" disabled={pending || socialPending !== null} aria-busy={socialPending === provider}
                onClick={() => void signInWithProvider(provider)}
                className="flex min-h-11 items-center justify-center gap-3 rounded-md border border-border bg-background px-4 text-sm font-semibold text-ink transition hover:border-ink hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-60">
                <span aria-hidden="true" className="grid size-5 place-items-center rounded-full border border-border text-xs font-bold">{mark}</span>
                {socialPending === provider ? "Connecting…" : label}
              </button>
            ))}
          </div>
          {socialError ? <p role="alert" className="rounded-md border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">{socialError}</p> : null}
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-slate"><span className="h-px flex-1 bg-border" /><span>or use email</span><span className="h-px flex-1 bg-border" /></div>
        </>
      ) : null}
      {fields.map(({ label, ...field }) => {
        const id = `${mode}-${field.name}`;
        const error = state.fieldErrors?.[field.name]?.join(" ");
        const passwordHelp = field.name === "password" && mode !== "login";
        const describedBy = [error ? `${id}-error` : null, passwordHelp ? `${id}-help` : null].filter(Boolean).join(" ") || undefined;
        return (
          <div key={field.name}>
            <label htmlFor={id} className="block text-sm text-ink">{label}</label>
            <div className="relative mt-1">
              <input {...field} type={field.type === "password" && showPassword ? "text" : field.type} id={id} disabled={pending} aria-invalid={error ? true : undefined} aria-describedby={describedBy}
                minLength={passwordHelp ? 12 : undefined}
                className="h-11 w-full rounded-md border border-border bg-background px-3 pr-16 text-base text-ink outline-none transition focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/20 disabled:opacity-60" />
              {field.type === "password" ? <button type="button" className="absolute inset-y-0 right-0 min-w-14 px-3 text-xs font-semibold text-slate underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? "Hide" : "Show"}</button> : null}
            </div>
            {passwordHelp ? <p id={`${id}-help`} className="mt-1 text-xs text-slate">Use 12–128 characters.</p> : null}
            {error ? <p id={`${id}-error`} className="mt-1 text-sm text-error">{error}</p> : null}
          </div>
        );
      })}
      <button type="submit" disabled={pending} aria-busy={pending} aria-live="polite" className={paperButton({ className: "disabled:cursor-wait" })}>
        {pending ? <span aria-hidden="true" className="mr-2 inline-block size-3 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.1em]" /> : null}
        {pending ? pendingLabels[mode] : labels[mode]}
      </button>
      {mode === "reset" && state.status === "success" ? <Link href="/account" className="text-center text-sm text-ink underline">Continue to account</Link> : null}
    </form>
  );
}
