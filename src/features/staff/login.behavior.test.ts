import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
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
  state.rows = [];
});

describe("staff session boundaries", () => {
  it("only clears the local session when a signed-in user lacks a staff role", async () => {
    await expect(authenticateStaff({ email: "admin@papersourcegh.com", password: "password" })).rejects.toThrow("That staff sign-in is not valid.");
    expect(state.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
});
