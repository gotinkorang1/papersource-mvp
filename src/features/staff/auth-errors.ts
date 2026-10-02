export function isStaffAuthServiceUnavailable(error: { status?: unknown; code?: unknown } | null | undefined) {
  const status = typeof error?.status === "number" ? error.status : 0;
  const code = typeof error?.code === "string" ? error.code : "";
  return status === 402 || status === 429 || status >= 500 || code === "over_request_rate_limit";
}
