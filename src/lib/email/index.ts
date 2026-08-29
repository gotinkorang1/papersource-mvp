/** Resend + React Email templates — implement with the commerce/RFQ emails. */
export function emailNotConfigured(): never {
  throw new Error("Resend is not wired yet. See docs/PRODUCT.md email list.");
}
