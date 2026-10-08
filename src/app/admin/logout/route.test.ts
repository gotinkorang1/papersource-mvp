import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ signOut: vi.fn(), create: vi.fn(), cookieStore: { getAll: vi.fn(), delete: vi.fn() } }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: state.create }));
vi.mock("next/headers", () => ({ cookies: async () => state.cookieStore }));

import { POST } from "./route";

beforeEach(() => {
  vi.resetAllMocks();
  state.create.mockResolvedValue({ auth: { signOut: state.signOut } });
  state.signOut.mockResolvedValue({ error: null });
  state.cookieStore.getAll.mockReturnValue([]);
});

describe("admin logout", () => {
  it("revokes only the current browser session", async () => {
    const response = await POST(new Request("https://papersourcegh.com/admin/logout"));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://papersourcegh.com/admin/login");
    expect(state.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("still returns to sign-in when Supabase is unavailable", async () => {
    state.create.mockRejectedValue(new Error("quota restricted"));
    const response = await POST(new Request("https://papersourcegh.com/admin/logout"));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://papersourcegh.com/admin/login");
  });

  it("clears local Supabase auth cookies when remote revocation fails", async () => {
    state.signOut.mockResolvedValue({ error: { status: 402, message: "quota restricted" } });
    state.cookieStore.getAll.mockReturnValue([
      { name: "sb-example-auth-token", value: "secret" },
      { name: "sb-example-auth-token.0", value: "secret" },
      { name: "ps_sid", value: "guest-session" },
    ]);

    await POST(new Request("https://papersourcegh.com/admin/logout"));

    expect(state.cookieStore.delete).toHaveBeenCalledWith("sb-example-auth-token");
    expect(state.cookieStore.delete).toHaveBeenCalledWith("sb-example-auth-token.0");
    expect(state.cookieStore.delete).not.toHaveBeenCalledWith("ps_sid");
  });
});
