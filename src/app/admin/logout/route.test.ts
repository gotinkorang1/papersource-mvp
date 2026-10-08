import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ signOut: vi.fn(), create: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: state.create }));

import { POST } from "./route";

beforeEach(() => {
  vi.resetAllMocks();
  state.create.mockResolvedValue({ auth: { signOut: state.signOut } });
  state.signOut.mockResolvedValue({ error: null });
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
});
