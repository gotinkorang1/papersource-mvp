import { inclusiveTaxPortion } from "@/lib/money";

/** Ghana VAT defaults to 15%; operational settings may override the rate in basis points. */
export const GHANA_VAT_BPS = 1500;

export type TaxLine = {
  name: string;
  rate_bps: number;
  amount: number;
};

export function inclusiveVatBreakdown(
  inclusivePesewas: number,
  rateBps = GHANA_VAT_BPS,
): {
  taxTotal: number;
  taxJson: TaxLine[];
} {
  const taxTotal = inclusiveTaxPortion(inclusivePesewas, rateBps);
  return {
    taxTotal,
    taxJson: [{ name: "VAT", rate_bps: rateBps, amount: taxTotal }],
  };
}
