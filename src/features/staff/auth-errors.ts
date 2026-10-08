export function isStaffAuthServiceUnavailable(error: { status?: unknown; code?: unknown } | null | undefined) {
  const status = typeof error?.status === "number" ? error.status : 0;
  const code = typeof error?.code === "string" ? error.code : "";
  return status === 402 || status === 408 || status === 425 || status === 429 || status >= 500 || [
    "over_request_rate_limit", "rate_limit_exceeded", "service_unavailable", "temporarily_unavailable",
    "bad_gateway", "gateway_timeout", "internal_server_error", "database_unavailable",
  ].includes(code);
}
