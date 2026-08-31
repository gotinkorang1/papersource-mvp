const customerReturnPaths = new Set([
  "/account",
  "/account/orders",
  "/account/quotes",
  "/account/addresses",
  "/account/organisation",
  "/cart",
  "/quote",
  "/checkout",
  "/request-quote",
]);

export function safeCustomerReturnPath(value: unknown): string {
  return typeof value === "string" && customerReturnPaths.has(value)
    ? value
    : "/account";
}
