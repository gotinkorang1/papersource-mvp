"use client";

import { useFormStatus } from "react-dom";
import { signOutCustomerAction } from "@/features/account/auth-actions";
import { paperButton } from "@/components/commerce/paper-button";

function SubmitSignOut() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} aria-busy={pending} className={paperButton({ variant: "secondary", className: "disabled:cursor-wait" })}>{pending ? "Signing out…" : "Sign out"}</button>;
}

export function SignOutButton() {
  return <form action={signOutCustomerAction}><SubmitSignOut /></form>;
}
