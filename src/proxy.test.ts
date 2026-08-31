import { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";
import type { CookieMethodsServer } from "@supabase/ssr";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({
  configured: false,
  refresh: (async () => {}) as (cookies: CookieMethodsServer) => Promise<void>,
}));
vi.mock("@/lib/env", () => ({ publicEnv: {
  get NEXT_PUBLIC_SUPABASE_URL() { return state.configured ? "http://127.0.0.1:55321" : ""; },
  get NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY() { return state.configured ? "public-test-key" : ""; },
} }));
vi.mock("@supabase/ssr", () => ({ createServerClient: (_url: string, _key: string, options: { cookies: CookieMethodsServer }) => ({
  auth: { getClaims: () => state.refresh(options.cookies) },
}) }));
import { proxy } from "./proxy";
const sessionId = "a7105cc2-81b4-44e5-bdf3-87f929c1c501";
beforeEach(() => { state.configured = false; state.refresh = async () => {}; });

it("makes a new guest ID available to the current request and browser", async () => {
  const request = new NextRequest("http://localhost:3000/shop");
  const response = await proxy(request);
  expect(response.cookies.get("ps_sid")?.value).toMatch(/^[0-9a-f-]{36}$/);
  expect(request.cookies.get("ps_sid")?.value).toBe(response.cookies.get("ps_sid")?.value);
  expect(response.headers.get("x-middleware-request-cookie")).toContain("ps_sid=");
});
it("preserves a valid guest ID", async () => {
  const request = new NextRequest("http://localhost:3000/cart", { headers: { cookie: `ps_sid=${sessionId}` } });
  const response = await proxy(request);
  expect(request.cookies.get("ps_sid")?.value).toBe(sessionId);
  expect(response.cookies.get("ps_sid")).toBeUndefined();
});
it("forwards Auth refresh cookies and cache headers without losing guest identity", async () => {
  state.configured = true;
  state.refresh = async (cookies) => {
    await cookies.setAll?.([{ name: "sb-test-auth-token.0", value: "new-0", options: { path: "/", sameSite: "lax" } }], { "Cache-Control": "private, no-store", "Pragma": "no-cache" });
    await cookies.setAll?.([{ name: "sb-test-auth-token.1", value: "new-1", options: { path: "/", secure: true } }], { "Expires": "0" });
  };
  const request = new NextRequest("http://localhost:3000/account");
  const response = await proxy(request);
  for (const suffix of ["0", "1"]) {
    expect(response.cookies.get(`sb-test-auth-token.${suffix}`)?.value).toBe(`new-${suffix}`);
    expect(request.cookies.get(`sb-test-auth-token.${suffix}`)?.value).toBe(`new-${suffix}`);
    expect(response.headers.get("x-middleware-request-cookie")).toContain(`new-${suffix}`);
  }
  expect(response.cookies.get("sb-test-auth-token.1")?.secure).toBe(true);
  expect(response.cookies.get("ps_sid")?.value).toBe(request.cookies.get("ps_sid")?.value);
  expect(response.headers.get("cache-control")).toContain("no-store");
  expect(response.headers.get("pragma")).toBe("no-cache");
  expect(response.headers.get("expires")).toBe("0");
});
it("does not create cookies before Quick Order Origin validation", async () => {
  state.configured = true;
  state.refresh = async () => { throw new Error("Auth must not run before this handler's Origin check"); };
  const request = new NextRequest("http://localhost:3000/quick-order/add", { method: "POST", headers: { origin: "https://foreign.example" } });
  expect((await proxy(request)).cookies.getAll()).toEqual([]);
});
