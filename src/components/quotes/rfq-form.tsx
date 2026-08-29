"use client";

import { useActionState } from "react";
import { GhanaAddressForm } from "@/components/commerce/ghana-address-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitRfqAction } from "@/features/quotations/actions";

const ORGANIZATION_TYPES = [
  ["business", "Business"],
  ["school", "School"],
  ["government", "Government"],
  ["ngo", "NGO"],
  ["hospital", "Hospital"],
  ["church", "Church"],
  ["university", "University"],
  ["retailer", "Retailer"],
  ["other", "Other"],
] as const;

export function RfqForm() {
  const [state, action, pending] = useActionState(submitRfqAction, null);

  return (
    <div className="space-y-4">
      {state?.error ? (
        <p role="alert" className="border border-error/40 bg-cream px-4 py-3 text-sm text-error">
          {state.error}
        </p>
      ) : null}
      <GhanaAddressForm
        action={action}
        submitLabel={pending ? "Submitting quotation…" : "Submit RFQ"}
        submitDisabled={pending}
      >
        <div className="space-y-4 border-t border-border pt-4">
          <div className="space-y-1.5">
            <Label htmlFor="organizationName">
              Organisation name <span className="text-error">*</span>
            </Label>
            <Input id="organizationName" name="organizationName" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="organizationType">Organisation type</Label>
            <select
              id="organizationType"
              name="organizationType"
              defaultValue="business"
              className="h-10 w-full rounded-md border border-border bg-cream px-3 text-sm text-ink"
            >
              {ORGANIZATION_TYPES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactName">
              Contact person <span className="text-error">*</span>
            </Label>
            <Input id="contactName" name="contactName" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">
              Email <span className="text-error">*</span>
            </Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="requestedDeliveryDate">Requested delivery date</Label>
            <Input id="requestedDeliveryDate" name="requestedDeliveryDate" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" />
          </div>
        </div>
      </GhanaAddressForm>
    </div>
  );
}
