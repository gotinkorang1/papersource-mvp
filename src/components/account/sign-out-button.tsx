"use client";

import { useFormStatus } from "react-dom";
import { signOutCustomerAction } from "@/features/account/auth-actions";
import { paperButton } from "@/components/commerce/paper-button";

function SubmitSignOut() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} aria-busy={pending} aria-live="polite" className={paperButton({ variant: "secondary", className: "disabled:cursor-wait" })}>
    {pending ? <span aria-hidden="true" className="mr-2 inline-block size-3 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.1em]" /> : null}
    {pending ? "Signing out…" : "Sign out"}
  </button>;
}

export function SignOutButton() {
  return <form action={signOutCustomerAction}><SubmitSignOut /></form>;
}
