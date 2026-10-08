export function isTransientAuthError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { status?: unknown; code?: unknown };
  const status = typeof candidate.status === "number" ? candidate.status : null;
  const code = typeof candidate.code === "string" ? candidate.code : "";
  return status === 402 || status === 408 || status === 425 || status === 429 || (status !== null && status >= 500) || [
    "over_request_rate_limit", "rate_limit_exceeded", "service_unavailable", "temporarily_unavailable",
    "bad_gateway", "gateway_timeout", "internal_server_error", "database_unavailable",
  ].includes(code);
}
