import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
vi.mock("server-only", () => ({}));
const boundary = vi.hoisted(() => ({
  merge: vi.fn(), profile: vi.fn(),
  env: { NEXT_PUBLIC_SUPABASE_URL: "https://auth.example.test", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-publishable-key", NEXT_PUBLIC_SITE_URL: "https://papersourcegh.com" },
}));
vi.mock("@/lib/env", () => ({ publicEnv: boundary.env }));
vi.mock("@/lib/customer/profiles", () => ({ synchronizeCustomerProfile: boundary.profile }));
vi.mock("@/features/account/merge", () => ({ mergeGuestCommerce: boundary.merge }));
import { GET } from "./route";

const profileId = "18cc3e14-1525-4b7f-b4bd-174d5518461d";
const sessionId = "28cc3e14-1525-4b7f-b4bd-174d5518461d";
const user = { id: profileId, email: "ama@example.test", aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: { full_name: "Ama" }, created_at: "2026-08-01T00:00:00Z" };
const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
const jwt = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: profileId, email: user.email, role: "authenticated", is_anonymous: false, user_metadata: user.user_metadata, exp: 4102444800 })}.${encode("test-signature")}`;
const session = { access_token: jwt, refresh_token: "private-refresh-token", token_type: "bearer", expires_in: 3600, expires_at: 4102444800, user };
const calls: { path: string; body: unknown }[] = [];
let rejectToken = false;

function request(query: string, cookie = sessionId) {
  return new NextRequest(`https://papersourcegh.com/auth/confirm?${query}`, { headers: { cookie: `ps_sid=${cookie}` } });
}
beforeEach(() => {
  vi.resetAllMocks(); calls.length = 0; rejectToken = false;
  boundary.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-publishable-key";
  boundary.profile.mockImplementation(async (identity) => identity);
  // Only the external HTTP boundary is simulated; exercise the actual SSR SDK,
  // JWT verification service and NextRequest/NextResponse cookie serialization.
  vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input : input.url);
    const path = url.pathname + url.search;
    const body = typeof init?.body === "string" ? JSON.parse(init.body) : null;
    calls.push({ path, body });
    if (url.pathname === "/auth/v1/verify") return rejectToken
      ? Response.json({ code: "otp_expired", msg: "private expired-token detail" }, { status: 403 })
      : Response.json(session);
    if (url.pathname === "/auth/v1/user") return Response.json(user);
    if (url.pathname === "/auth/v1/logout") return new Response(null, { status: 204 });
    throw new Error(`Unexpected test Auth endpoint: ${url.pathname}`);
  });
});
afterEach(() => { vi.unstubAllGlobals(); });

describe("token hash confirmation callback with real Supabase SSR", () => {
  it("verifies token hash, merges server cookie identity and keeps session/no-cache headers on a clean redirect", async () => {
    const response = await GET(request("token_hash=private-hash&type=email&next=%2Fcheckout&profileId=forged&sessionId=forged"));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://papersourcegh.com/checkout");
    expect(response.cookies.getAll().some(({ name, value }) => name.startsWith("sb-") && value.length > 0)).toBe(true);
    expect(response.headers.get("cache-control")).toMatch(/private.*no-cache.*no-store/);
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(response.headers.get("expires")).toBe("0");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(boundary.merge).toHaveBeenCalledExactlyOnceWith({ profileId, sessionId });
    expect(calls).toContainEqual({ path: "/auth/v1/verify", body: { token_hash: "private-hash", type: "email", gotrue_meta_security: {} } });
    expect(calls.some(({ path }) => path === "/auth/v1/user")).toBe(true);
    expect(await response.text()).not.toMatch(/private-hash|private-refresh-token/);
  });
  it("keeps recovery cookies and forces the password page even with a foreign next", async () => {
    const response = await GET(request("token_hash=private-hash&type=recovery&next=https%3A%2F%2Fevil.test"));
    expect(response.headers.get("location")).toBe("https://papersourcegh.com/reset-password");
    expect(response.cookies.getAll().length).toBeGreaterThan(0);
  });
  it.each(["https://evil.test", "//evil.test", "/admin", "%2f%2fevil.test"])("sanitizes next %s", async (next) => {
    const response = await GET(request(`token_hash=private-hash&type=email&next=${encodeURIComponent(next)}`));
    expect(response.headers.get("location")).toBe("https://papersourcegh.com/account");
  });
  it.each(["type=email", "token_hash=private-hash&type=invite", "token_hash=&type=email", "token_hash=private-hash&type=sms"])("rejects invalid input before token exchange: %s", async (query) => {
    const response = await GET(request(query));
    expect(response.headers.get("location")).toBe("https://papersourcegh.com/login?authError=confirmation");
    expect(calls).toEqual([]);
    expect(boundary.merge).not.toHaveBeenCalled();
    expect(response.cookies.getAll()).toEqual([]);
  });
  it("offers recovery after an expired token without reflecting secrets", async () => {
    rejectToken = true;
    const response = await GET(request("token_hash=private-hash&type=recovery"));
    expect(response.headers.get("location")).toBe("https://papersourcegh.com/forgot-password?authError=confirmation");
    expect(boundary.merge).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.cookies.getAll()).toEqual([]);
  });
  it("clears the newly created session if profile synchronization fails", async () => {
    boundary.profile.mockRejectedValue(new Error("private SQL"));
    const response = await GET(request("token_hash=private-hash&type=email"));
    expect(response.headers.get("location")).toBe("https://papersourcegh.com/login?authError=confirmation");
    expect(response.cookies.getAll().filter(({ name }) => name.startsWith("sb-")).every(({ value }) => value === "")).toBe(true);
    expect(boundary.merge).not.toHaveBeenCalled();
  });
  it("retains cookie clearing and no-cache headers when the merge fails", async () => {
    boundary.merge.mockRejectedValue(new Error("private SQL"));
    const response = await GET(request("token_hash=private-hash&type=email"));
    expect(response.headers.get("location")).toBe("https://papersourcegh.com/login?authError=confirmation");
    expect(calls.some(({ path }) => path === "/auth/v1/logout?scope=local")).toBe(true);
    expect(response.cookies.getAll().filter(({ name }) => name.startsWith("sb-")).every(({ value }) => value === "")).toBe(true);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("rejects malformed guest cookies and ignores client session IDs", async () => {
    await GET(request(`token_hash=private-hash&type=email&sessionId=${sessionId}`, "malformed"));
    expect(boundary.merge).toHaveBeenCalledExactlyOnceWith({ profileId, sessionId: null });
  });
  it("fails closed without configured Auth", async () => {
    boundary.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "";
    const response = await GET(request("token_hash=private-hash&type=email"));
    expect(response.headers.get("location")).toBe("https://papersourcegh.com/login?authError=confirmation");
    expect(calls).toEqual([]);
    expect(boundary.merge).not.toHaveBeenCalled();
  });
});
