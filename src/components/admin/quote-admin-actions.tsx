"use client";

import { paperButton } from "@/components/commerce/paper-button";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pesewasToMajor } from "@/lib/money";
import { canAccessAdmin, canConfirmQuoteTerms } from "@/lib/staff/rbac";
import type { StaffRole } from "@/lib/staff/types";

type QuoteLine = {
  id: string;
  nameSnapshot: string;
  skuSnapshot: string;
  specSnapshot: string | null;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
};

export function QuoteAdminActions({
  quoteId,
  status,
  role,
  lines,
  deliveryFee,
}: {
  quoteId: string;
  status: string;
  role: StaffRole;
  lines: QuoteLine[];
  deliveryFee: number;
}) {
  const canWrite = canAccessAdmin(role, "quotes", "write");
  const canTerms = canConfirmQuoteTerms(role);
  if (!canWrite && !canTerms) {
    return (
      <p className="text-sm text-slate">
        This role can read quotations but cannot price or send them.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {canWrite && status === "submitted" ? (
        <form action="/admin/quotes/mutate" method="post">
          <input type="hidden" name="quoteId" value={quoteId} />
          <input type="hidden" name="intent" value="start-review" />
          <SubmitProgressButton idleLabel="Start review" pendingLabel="Starting review…" className={paperButton()} />
        </form>
      ) : null}

      {canWrite && (status === "under_review" || status === "priced") ? (
        <form action="/admin/quotes/mutate" method="post" className="space-y-4">
          <input type="hidden" name="quoteId" value={quoteId} />
          <input type="hidden" name="intent" value="save-prices" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Quote line prices in GHS</caption>
              <thead>
                <tr className="border-b border-border text-left text-slate">
                  <th className="py-2 font-medium">Item</th>
                  <th className="py-2 font-medium">SKU</th>
                  <th className="py-2 font-medium">Qty</th>
                  <th className="py-2 font-medium">Unit price (GHS)</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className="border-b border-border">
                    <td className="py-3">
                      <p className="text-ink">{line.nameSnapshot}</p>
                      <p className="text-xs text-slate">{line.specSnapshot}</p>
                    </td>
                    <td className="py-3 font-mono text-xs">{line.skuSnapshot}</td>
                    <td className="py-3 tabular-nums">{line.quantity}</td>
                    <td className="py-3">
                      <Label htmlFor={`price-${line.id}`} className="sr-only">
                        Unit price for {line.nameSnapshot}
                      </Label>
                      <Input
                        id={`price-${line.id}`}
                        name={`price:${line.id}`}
                        defaultValue={
                          line.unitPrice === null ? "" : pesewasToMajor(line.unitPrice)
                        }
                        required
                        inputMode="decimal"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="max-w-xs space-y-1.5">
            <Label htmlFor="deliveryFee">Delivery fee (GHS)</Label>
            <Input
              id="deliveryFee"
              name="deliveryFee"
              defaultValue={pesewasToMajor(deliveryFee)}
              inputMode="decimal"
            />
          </div>
          <SubmitProgressButton idleLabel="Save prices" pendingLabel="Saving prices…" className={paperButton()} />
        </form>
      ) : null}

      {canWrite && status === "priced" ? (
        <form action="/admin/quotes/mutate" method="post">
          <input type="hidden" name="quoteId" value={quoteId} />
          <input type="hidden" name="intent" value="send" />
          <SubmitProgressButton idleLabel="Send quote" pendingLabel="Sending quote…" className={paperButton({ variant: "quote" })} />
        </form>
      ) : null}

      {canWrite && (status === "submitted" || status === "under_review") ? (
        <form action="/admin/quotes/mutate" method="post">
          <input type="hidden" name="quoteId" value={quoteId} />
          <input type="hidden" name="intent" value="decline" />
          <SubmitProgressButton idleLabel="Decline" pendingLabel="Declining…" className={paperButton({ variant: "secondary" })} />
        </form>
      ) : null}

      {canWrite && status === "sent" ? (
        <form action="/admin/quotes/mutate" method="post">
          <input type="hidden" name="quoteId" value={quoteId} />
          <input type="hidden" name="intent" value="revise" />
          <SubmitProgressButton idleLabel="Revise quotation" pendingLabel="Revising…" className={paperButton({ variant: "secondary" })} />
        </form>
      ) : null}

      {canTerms && (status === "accepted" || status === "payment_pending") ? (
        <form action="/admin/quotes/mutate" method="post" className="space-y-3">
          <input type="hidden" name="quoteId" value={quoteId} />
          <input type="hidden" name="intent" value="confirm-terms" />
          <div className="max-w-xs space-y-1.5">
            <Label htmlFor="provider">Payment terms</Label>
            <select
              id="provider"
              name="provider"
              required
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-ink"
            >
              <option value="bank_transfer">Bank transfer</option>
              <option value="purchase_order">Purchase order</option>
              <option value="invoice_terms">Invoice terms</option>
            </select>
          </div>
          <div className="max-w-md space-y-1.5">
            <Label htmlFor="note">Reference / notes</Label>
            <Input id="note" name="note" placeholder="PO number or transfer ref" />
          </div>
          <SubmitProgressButton idleLabel="Confirm terms" pendingLabel="Confirming terms…" className={paperButton()} />
        </form>
      ) : null}
    </div>
  );
}
