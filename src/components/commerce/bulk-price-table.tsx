import { formatGhs } from "@/lib/money";
import type { PriceTierPreview } from "@/types/catalogue";

export function BulkPriceTable({
  tiers,
  unitLabel,
}: {
  tiers: PriceTierPreview[];
  unitLabel: string;
}) {
  if (tiers.length === 0) {
    return null;
  }

  return (
    <table className="w-full text-sm text-slate">
      <caption className="sr-only">Bulk price tiers</caption>
      <tbody>
        {tiers.map((tier) => {
          const qty =
            tier.maximumQuantity === null
              ? `${tier.minimumQuantity}+`
              : `${tier.minimumQuantity}–${tier.maximumQuantity}`;

          return (
            <tr key={`${tier.minimumQuantity}-${tier.maximumQuantity}`}>
              <th scope="row" className="py-0.5 pr-3 text-left font-normal">
                {qty}
              </th>
              <td className="py-0.5 text-right tabular-nums text-ink">
                {tier.requestQuote || tier.unitPricePesewas === null
                  ? "Request bulk price"
                  : `${formatGhs(tier.unitPricePesewas)} / ${unitLabel}`}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
