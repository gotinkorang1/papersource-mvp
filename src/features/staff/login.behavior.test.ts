import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  clearLocalSupabaseAuthCookies: vi.fn(),
  rows: [] as unknown[],
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(async () => ({ auth: {
    signInWithPassword: state.signInWithPassword,
    signOut: state.signOut,
  } })),
}));
vi.mock("@/lib/db/client", () => ({ getDb: vi.fn(() => ({
  select: () => ({
    from: () => ({
      innerJoin: () => ({
        where: () => ({ limit: async () => state.rows }),
      }),
    }),
  }),
})) }));
vi.mock("@/lib/supabase/clear-auth-cookies", () => ({ clearLocalSupabaseAuthCookies: state.clearLocalSupabaseAuthCookies }));
vi.mock("@/lib/db/schema", () => ({
  adminRoles: { role: "role", profileId: "profileId" },
  profiles: { id: "id", email: "email" },
}));
vi.mock("drizzle-orm", () => ({ eq: vi.fn((left, right) => ({ left, right })) }));

import { authenticateStaff } from "./login";

beforeEach(() => {
  vi.resetAllMocks();
  state.signInWithPassword.mockResolvedValue({ data: { user: { email: "admin@papersourcegh.com" } }, error: null });
  state.signOut.mockResolvedValue({ error: null });
  state.clearLocalSupabaseAuthCookies.mockResolvedValue(undefined);
  state.rows = [];
});

describe("staff session boundaries", () => {
  it("only clears the local session when a signed-in user lacks a staff role", async () => {
    await expect(authenticateStaff({ email: "admin@papersourcegh.com", password: "password" })).rejects.toThrow("That staff sign-in is not valid.");
    expect(state.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("clears local auth cookies if role rejection cannot revoke the remote session", async () => {
    state.signOut.mockResolvedValue({ error: { status: 503, message: "Auth unavailable" } });
    await expect(authenticateStaff({ email: "admin@papersourcegh.com", password: "password" })).rejects.toThrow("That staff sign-in is not valid.");
    expect(state.clearLocalSupabaseAuthCookies).toHaveBeenCalledOnce();
  });

  it("turns Auth transport failures into a retryable staff error", async () => {
    state.signInWithPassword.mockRejectedValue(new Error("network detail"));
    await expect(authenticateStaff({ email: "admin@papersourcegh.com", password: "password" })).rejects.toMatchObject({
      code: "unavailable",
      message: expect.stringContaining("temporarily unavailable"),
    });
  });
});
