import type { AddressSnapshot } from "@/lib/db/schema/identity";

export function customerEmailFromSnapshot(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== "object") {
    return undefined;
  }
  const email = (snapshot as AddressSnapshot).email;
  return typeof email === "string" && email.includes("@") ? email : undefined;
}

export function customerNameFromSnapshot(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== "object") return undefined;
  const name = (snapshot as AddressSnapshot).fullName;
  return typeof name === "string" && name.trim() ? name.trim() : undefined;
}
