import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ cookies: vi.fn(), delete: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: state.cookies }));

import { clearLocalSupabaseAuthCookies, isSupabaseAuthCookieName } from "./clear-auth-cookies";

beforeEach(() => {
  vi.resetAllMocks();
  state.cookies.mockResolvedValue({
    getAll: () => [
      { name: "sb-example-auth-token" },
      { name: "sb-example-auth-token.0" },
      { name: "ps_sid" },
    ],
    delete: state.delete,
  });
});

describe("Supabase auth cookie cleanup", () => {
  it("matches only session cookie chunks", () => {
    expect(isSupabaseAuthCookieName("sb-example-auth-token")).toBe(true);
    expect(isSupabaseAuthCookieName("sb-example-auth-token.0")).toBe(true);
    expect(isSupabaseAuthCookieName("ps_sid")).toBe(false);
    expect(isSupabaseAuthCookieName("sb-example-refresh-token")).toBe(false);
  });

  it("removes Supabase sessions without touching the guest session", async () => {
    await clearLocalSupabaseAuthCookies();
    expect(state.delete).toHaveBeenCalledTimes(2);
    expect(state.delete).toHaveBeenNthCalledWith(1, "sb-example-auth-token");
    expect(state.delete).toHaveBeenNthCalledWith(2, "sb-example-auth-token.0");
  });

  it("does not throw when the framework cookie store is unavailable", async () => {
    state.cookies.mockRejectedValue(new Error("cookie store unavailable"));
    await expect(clearLocalSupabaseAuthCookies()).resolves.toBeUndefined();
  });
});
