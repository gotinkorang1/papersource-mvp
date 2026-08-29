"use client";

import { paperButton } from "@/components/commerce/paper-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pesewasToMajor } from "@/lib/money";
import { canAccessAdmin } from "@/lib/staff/rbac";
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
  if (!canWrite) {
    return (
      <p className="text-sm text-slate">
        This role can read quotations but cannot price or send them.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {status === "submitted" ? (
        <form action="/admin/quotes/mutate" method="post">
          <input type="hidden" name="quoteId" value={quoteId} />
          <input type="hidden" name="intent" value="start-review" />
          <button type="submit" className={paperButton()}>
            Start review
          </button>
        </form>
      ) : null}

      {status === "under_review" || status === "priced" ? (
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
          <button type="submit" className={paperButton()}>
            Save prices
          </button>
        </form>
      ) : null}

      {status === "priced" ? (
        <form action="/admin/quotes/mutate" method="post">
          <input type="hidden" name="quoteId" value={quoteId} />
          <input type="hidden" name="intent" value="send" />
          <button type="submit" className={paperButton({ variant: "quote" })}>
            Send quote
          </button>
        </form>
      ) : null}

      {status === "submitted" || status === "under_review" ? (
        <form action="/admin/quotes/mutate" method="post">
          <input type="hidden" name="quoteId" value={quoteId} />
          <input type="hidden" name="intent" value="decline" />
          <button type="submit" className={paperButton({ variant: "secondary" })}>
            Decline
          </button>
        </form>
      ) : null}
    </div>
  );
}
