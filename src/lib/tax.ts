import { inclusiveTaxPortion } from "@/lib/money";

/** Ghana VAT 15%. Admin-configurable rates come later; one function used everywhere. */
export const GHANA_VAT_BPS = 1500;

export type TaxLine = {
  name: string;
  rate_bps: number;
  amount: number;
};

export function inclusiveVatBreakdown(inclusivePesewas: number): {
  taxTotal: number;
  taxJson: TaxLine[];
} {
  const taxTotal = inclusiveTaxPortion(inclusivePesewas, GHANA_VAT_BPS);
  return {
    taxTotal,
    taxJson: [{ name: "VAT", rate_bps: GHANA_VAT_BPS, amount: taxTotal }],
  };
}
