import { createHash } from "node:crypto";

const NAMESPACE = "papersource.seed.v1";

/** Stable UUIDs so seed re-runs and storefront queries share the same keys. */
export function seedUuid(kind: string, key: string): string {
  const hex = createHash("sha256")
    .update(`${NAMESPACE}:${kind}:${key}`)
    .digest("hex");

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `${((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16)}${hex.slice(18, 20)}`,
    hex.slice(20, 32),
  ].join("-");
}
