import { resolveUnitPrice, type ResolvedPrice } from "@/features/catalogue/pricing";

export function retailCheckoutBlocked(resolved: ResolvedPrice) {
  return resolved.requestQuote || resolved.unitPricePesewas === null;
}

export { resolveUnitPrice };
