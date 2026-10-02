"use client";

import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { paperButton } from "@/components/commerce/paper-button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={`${paperButton()} min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60`}
      disabled={pending}
      aria-busy={pending}
      aria-live="polite"
    >
      {pending ? (
        <span aria-hidden="true" className="mr-2 inline-block size-3 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.1em]" />
      ) : null}
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function StaffLoginForm({ error, retryable = false }: { error?: string; retryable?: boolean }) {
  return (
    <form
      action="/admin/auth"
      method="post"
      className="space-y-4"
    >
      {error ? (
        <p role="alert" aria-live="assertive" className={retryable
          ? "rounded-md border border-ochre/50 bg-ochre/10 px-4 py-3 text-sm text-ink"
          : "rounded-md border border-error/40 bg-error/10 px-4 py-3 text-sm text-error"}>
          {error}
        </p>
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor="staff-email">Email</Label>
        <Input
          id="staff-email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="staff-password">Password</Label>
        <Input
          id="staff-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <SubmitButton />
    </form>
  );
}
