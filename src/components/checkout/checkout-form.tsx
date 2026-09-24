"use client";

import { useActionState } from "react";
import {
  GhanaAddressForm,
  type GhanaAddressValues,
} from "@/components/commerce/ghana-address-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { placeRetailOrderAction } from "@/features/checkout/actions";

export function CheckoutForm({
  canPlaceOrder = true,
  defaultEmail,
  defaultAddress,
  savedAddresses,
}: {
  canPlaceOrder?: boolean;
  defaultEmail?: string;
  defaultAddress?: Partial<GhanaAddressValues>;
  savedAddresses?: Array<{ id: string; label: string; values: Partial<GhanaAddressValues> }>;
}) {
  const [state, action, pending] = useActionState(placeRetailOrderAction, null);

  return (
    <div className="space-y-4">
      {state?.error ? (
        <p role="alert" className="border border-error/40 bg-cream px-4 py-3 text-sm text-error">
          {state.error}
        </p>
      ) : null}
      <GhanaAddressForm
        action={canPlaceOrder ? action : undefined}
        defaultValues={defaultAddress}
        savedAddresses={savedAddresses}
        fieldErrors={state?.fieldErrors}
        submitLabel={
          canPlaceOrder ? (pending ? "Placing order…" : "Place order") : undefined
        }
        submitDisabled={pending}
        busy={pending}
      >
        <div className="space-y-1.5">
          <Label htmlFor="checkout-email">
            Email <span className="text-error">*</span>
          </Label>
          <Input
            id="checkout-email"
            name="email"
            type="email"
            required={canPlaceOrder}
            defaultValue={defaultEmail}
          />
        </div>
      </GhanaAddressForm>
    </div>
  );
}
