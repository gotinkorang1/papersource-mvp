"use client";

import { useFormStatus } from "react-dom";
import { signOutCustomerAction } from "@/features/account/auth-actions";
import { paperButton } from "@/components/commerce/paper-button";

function SubmitSignOut() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className={paperButton({ variant: "secondary" })}>{pending ? "Signing out…" : "Sign out"}</button>;
}

export function SignOutButton() {
  return <form action={signOutCustomerAction}><SubmitSignOut /></form>;
}
