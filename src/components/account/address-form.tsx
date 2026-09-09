"use client";

import { useActionState } from "react";
import { GhanaAddressForm, type GhanaAddressValues } from "@/components/commerce/ghana-address-form";
import { defaultAddressAction, removeAddressAction, saveAddressAction } from "@/features/account/actions";
import type { AccountActionState } from "@/features/account/actions-state";

export function AddressForm({ addressId, defaultValues, isDefault = false }: {
  addressId?: string;
  defaultValues: Partial<GhanaAddressValues>;
  isDefault?: boolean;
}) {
  const [state, action, pending] = useActionState(saveAddressAction, {} as AccountActionState);
  return (
    <GhanaAddressForm id={`address-${addressId ?? "new"}`} action={action} defaultValues={defaultValues}
      submitLabel={pending ? "Saving…" : "Save address"} submitDisabled={pending} fieldErrors={state.errors}>
      {addressId ? <input type="hidden" name="addressId" value={addressId} /> : null}
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="isDefault" value="true" defaultChecked={isDefault} />
        Default address
      </label>
      {state.message ? <p role={state.success ? "status" : "alert"} className={state.success ? "text-sm text-ink" : "text-sm text-error"}>{state.message}</p> : null}
    </GhanaAddressForm>
  );
}

export function AddressMutationButton({ addressId, intent }: { addressId: string; intent: "remove" | "default" }) {
  const [state, action, pending] = useActionState(intent === "remove" ? removeAddressAction : defaultAddressAction, {} as AccountActionState);
  return (
    <form action={action} onSubmit={(event) => {
      if (intent === "remove" && !window.confirm("Remove this saved address?")) event.preventDefault();
    }}>
      <input type="hidden" name="addressId" value={addressId} />
      <button type="submit" disabled={pending} className="min-h-10 underline disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink">
        {pending ? "Updating…" : intent === "remove" ? "Remove" : "Make default"}
      </button>
      {state.message ? <p role={state.success ? "status" : "alert"} className="text-sm">{state.message}</p> : null}
    </form>
  );
}
