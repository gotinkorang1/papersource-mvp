/** Paystack init / verify / webhook — implement in the retail payments phase. */
export function paystackNotConfigured(): never {
  throw new Error(
    "Paystack is not wired yet. Payments stay server-authoritative (docs/ECOMMERCE.md).",
  );
}
