import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ getUser: vi.fn(), redirect: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: async () => ({ auth: { getUser: state.getUser } }) }));
vi.mock("@/lib/db/client", () => ({ getDb: vi.fn(), isDatabaseConfigured: () => true }));
vi.mock("@/lib/db/schema", () => ({ adminRoles: {}, profiles: {} }));
vi.mock("drizzle-orm", () => ({ eq: vi.fn() }));
vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("not-found"); },
  redirect: (url: string) => { throw new Error(`redirect:${url}`); },
}));

import { readStaffActorStatus, requireStaff } from "./require";

beforeEach(() => {
  vi.resetAllMocks();
  state.getUser.mockResolvedValue({ data: { user: null }, error: null });
});

describe("staff identity availability", () => {
  it("distinguishes a signed-out admin from a temporary Auth outage", async () => {
    await expect(readStaffActorStatus()).resolves.toEqual({ actor: null, unavailable: false });
    state.getUser.mockRejectedValue(Object.assign(new Error("quota restricted"), { status: 402 }));
    await expect(readStaffActorStatus()).resolves.toEqual({ actor: null, unavailable: true });
  });

  it("preserves fail-closed access while showing a retryable login state", async () => {
    state.getUser.mockRejectedValue(Object.assign(new Error("quota restricted"), { status: 402 }));
    await expect(requireStaff()).rejects.toThrow("redirect:/admin/login?retryable=1");
  });
});
