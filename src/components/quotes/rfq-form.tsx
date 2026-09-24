"use client";

import { useActionState } from "react";
import { GhanaAddressForm, type GhanaAddressValues } from "@/components/commerce/ghana-address-form";
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

export function RfqForm({ customer, organization, defaultAddress }: {
  customer?: { fullName: string; email: string; phone: string | null };
  organization?: { name: string; type: string } | null;
  defaultAddress?: Partial<GhanaAddressValues>;
}) {
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
        defaultValues={{ fullName: customer?.fullName ?? "", phone: customer?.phone ?? "", ...defaultAddress }}
        submitLabel={pending ? "Submitting quotation…" : "Submit RFQ"}
        submitDisabled={pending}
        busy={pending}
      >
        <div className="space-y-4 border-t border-border pt-4">
          {organization ? (
            <label className="flex items-start gap-2 text-sm text-ink">
              <input type="checkbox" name="useSavedOrganization" value="true" />
              <span>Use my saved organisation: {organization.name}. Its members will be able to view this quotation.</span>
            </label>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="organizationName">
              Organisation name <span className="text-error">*</span>
            </Label>
            <Input id="organizationName" name="organizationName" defaultValue={organization?.name} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="organizationType">Organisation type</Label>
            <select
              id="organizationType"
              name="organizationType"
              defaultValue={organization?.type ?? "business"}
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
            <Input id="contactName" name="contactName" defaultValue={customer?.fullName} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">
              Email <span className="text-error">*</span>
            </Label>
            <Input id="email" name="email" type="email" defaultValue={customer?.email} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="requestedDeliveryDate">Requested delivery date</Label>
            <Input id="requestedDeliveryDate" name="requestedDeliveryDate" type="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="documentPurpose">Attachment type</Label>
            <select
              id="documentPurpose"
              name="documentPurpose"
              defaultValue="rfq"
              className="h-10 w-full rounded-md border border-border bg-cream px-3 text-sm text-ink"
            >
              <option value="rfq">RFQ document</option>
              <option value="purchase_order">Purchase order</option>
              <option value="procurement_list">Procurement list</option>
              <option value="internal">Other supporting file</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="documents">Attachments (optional)</Label>
            <Input
              id="documents"
              name="documents"
              type="file"
              multiple
              accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png,.webp"
            />
            <p className="text-sm text-slate">
              PDF, Excel, Word or image. Up to five files, 15 MB each. Stored
              privately — not on the public product CDN.
            </p>
          </div>
        </div>
      </GhanaAddressForm>
    </div>
  );
}
