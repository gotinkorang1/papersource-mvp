export const VIEW_FINGERPRINT_STORAGE_KEY = "papersource.catalogue.view-fingerprint";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function ensureViewFingerprint(storage: StorageLike): string {
  const existing = storage.getItem(VIEW_FINGERPRINT_STORAGE_KEY)?.trim();
  if (existing && existing.length >= 16) return existing;

  const next = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replaceAll("-", "")
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  storage.setItem(VIEW_FINGERPRINT_STORAGE_KEY, next);
  return next;
}
