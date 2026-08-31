import assert from "node:assert/strict";
import { test } from "node:test";
import { assertRevokedRefresh } from "./test-local-auth.mjs";

test("accepts only the revoked-token API response", () => {
  assert.doesNotThrow(() => assertRevokedRefresh({
    error: { code: "refresh_token_not_found", status: 400 }, data: { session: null },
  }));
});

// A transport failure must not masquerade as successful session revocation.
for (const error of [
  null,
  { name: "AuthRetryableFetchError", status: 0 },
  { code: "unexpected_failure", status: 500 },
  { code: "over_request_rate_limit", status: 429 },
  { code: "refresh_token_not_found", status: 500 },
]) {
  test(`rejects non-revocation error ${error?.code ?? error?.name ?? "none"}`, () => {
    assert.throws(() => assertRevokedRefresh({ error, data: { session: null } }));
  });
}
test("rejects a response that returned a session", () => {
  assert.throws(() => assertRevokedRefresh({
    error: { code: "refresh_token_not_found", status: 400 }, data: { session: {} },
  }));
});
