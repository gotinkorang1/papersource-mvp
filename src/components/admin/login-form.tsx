"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { paperButton } from "@/components/commerce/paper-button";

function SubmitButton({ submitted }: { submitted: boolean }) {
  const { pending } = useFormStatus();
  const busy = pending || submitted;
  return (
    <button
      type="submit"
      className={`${paperButton()} min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60`}
      disabled={busy}
      aria-busy={busy}
      aria-live="polite"
    >
      {busy ? (
        <span aria-hidden="true" className="mr-2 inline-block size-3 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.1em]" />
      ) : null}
      {busy ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function StaffLoginForm({ error }: { error?: string }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      action="/admin/auth"
      method="post"
      className="space-y-4"
      onSubmit={() => setSubmitted(true)}
    >
      {error ? (
        <p role="alert" className="rounded-md border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
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
      <SubmitButton submitted={submitted} />
    </form>
  );
}
