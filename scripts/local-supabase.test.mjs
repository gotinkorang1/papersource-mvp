import assert from "node:assert/strict";
import { test } from "node:test";
import { assertLoopbackBindings, assertLocalStatus } from "./local-supabase.mjs";

// Removing the all-interface rejection would fail these regression cases.
for (const host of ["0.0.0.0", "::", "", "192.168.1.5", undefined]) {
  test(`rejects published binding ${String(host)}`, () => {
    assert.throws(() => assertLoopbackBindings({ "5432/tcp": [{ HostIp: host }] }), /loopback/);
  });
}
test("accepts only loopback publications and unbound internal ports", () => {
  assert.doesNotThrow(() => assertLoopbackBindings({
    "5432/tcp": [{ HostIp: "127.0.0.1" }, { HostIp: "::1" }], "9999/tcp": null,
  }));
});
test("rejects mixed safe and unsafe bindings", () => {
  assert.throws(() => assertLoopbackBindings({
    "5432/tcp": [{ HostIp: "127.0.0.1" }, { HostIp: "::" }],
  }), /loopback/);
});
test("rejects missing publications so an invalid probe cannot pass", () => {
  for (const ports of [null, undefined, {}, { "5432/tcp": null }]) {
    assert.throws(() => assertLoopbackBindings(ports), /loopback/);
  }
});

const localStatus = {
  API_URL: "http://127.0.0.1:55321",
  DB_URL: "postgresql://postgres:postgres@127.0.0.1:55322/postgres",
};
test("accepts the dedicated local Auth endpoints", () => {
  assert.doesNotThrow(() => assertLocalStatus(localStatus));
});
for (const change of [
  { API_URL: "https://example.supabase.co" },
  { API_URL: "http://127.0.0.1:54321" },
  { API_URL: "http://127.0.0.1:55321/other" },
  { DB_URL: "postgresql://postgres:postgres@127.0.0.1:54329/postgres" },
  { DB_URL: "postgresql://postgres:postgres@example.com:55322/postgres" },
  { DB_URL: undefined },
]) {
  test(`refuses a different local/remote target (${Object.keys(change)[0]})`, () => {
    assert.throws(() => assertLocalStatus({ ...localStatus, ...change }), /PaperSource/);
  });
}
