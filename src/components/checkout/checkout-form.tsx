"use client";

import { useActionState } from "react";
import { GhanaAddressForm } from "@/components/commerce/ghana-address-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { placeRetailOrderAction } from "@/features/checkout/actions";

export function CheckoutForm({ canPlaceOrder = true }: { canPlaceOrder?: boolean }) {
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
        submitLabel={
          canPlaceOrder ? (pending ? "Placing order…" : "Place order") : undefined
        }
        submitDisabled={pending}
      >
        <div className="space-y-1.5">
          <Label htmlFor="checkout-email">
            Email <span className="text-error">*</span>
          </Label>
          <Input id="checkout-email" name="email" type="email" required={canPlaceOrder} />
        </div>
      </GhanaAddressForm>
    </div>
  );
}
