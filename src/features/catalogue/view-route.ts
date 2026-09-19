const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateProductViewPayload(input: { productId?: unknown; fingerprint?: unknown }) {
  const productId = typeof input.productId === "string" ? input.productId.trim() : "";
  const fingerprint = typeof input.fingerprint === "string" ? input.fingerprint.trim() : "";
  if (!UUID_RE.test(productId) || fingerprint.length < 16 || fingerprint.length > 128) return null;
  return { productId, fingerprint };
}
