import { isTransientAuthError } from "@/lib/auth/transient-error";

export function isStaffAuthServiceUnavailable(error: { status?: unknown; code?: unknown } | null | undefined) {
  return isTransientAuthError(error);
}
