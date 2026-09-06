"use client";

import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { paperButton } from "@/components/commerce/paper-button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={paperButton()} disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function StaffLoginForm({ error }: { error?: string }) {
  return (
    <form action="/admin/auth" method="post" className="space-y-4">
      {error ? (
        <p role="alert" className="border border-error/40 bg-cream px-4 py-3 text-sm text-error">
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
