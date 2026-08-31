import { createHmac } from "node:crypto";
import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({
  configured: true,
  getClaims: vi.fn(),
  sync: vi.fn(),
  cookie: "",
}));
vi.mock("@/lib/env", () => ({ publicEnv: {
  get NEXT_PUBLIC_SUPABASE_URL() { return state.configured ? "http://127.0.0.1:55321" : ""; },
  get NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY() { return state.configured ? "public-key" : ""; },
} }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: () => ({ value: state.cookie }) }) }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`); } }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: async () => ({ auth: { getClaims: state.getClaims } }) }));
vi.mock("@/lib/db/client", () => ({ isDatabaseConfigured: () => true, getDb: () => { throw new Error("No database access before verified identity"); } }));
vi.mock("./profiles", () => ({ synchronizeCustomerProfile: state.sync }));
import { readCustomerActor, requireCustomer } from "./require";
const sub = "a7105cc2-81b4-44e5-bdf3-87f929c1c501";
const actor = { profileId: sub, email: "ama@example.com", fullName: "Saved name", phone: null };
beforeEach(() => {
  vi.clearAllMocks();
  state.configured = true;
  state.cookie = "";
  state.getClaims.mockResolvedValue({ data: null, error: null });
  state.sync.mockResolvedValue(actor);
});
it("never accepts the old signed customer cookie as identity", async () => {
  const payload = `${sub}.${Date.now() + 60_000}`;
  state.cookie = `${payload}.${createHmac("sha256", process.env.CUSTOMER_SESSION_SECRET ?? "sk_customer_papersource_local").update(payload).digest("hex")}`;
  expect(await readCustomerActor()).toBeNull();
  expect(state.sync).not.toHaveBeenCalled();
});
it("loads the stored actor only after verified Supabase identity", async () => {
  state.getClaims.mockResolvedValue({ data: { claims: { sub, email: actor.email, role: "authenticated" } }, error: null });
  expect(await readCustomerActor()).toEqual(actor);
  expect(state.sync).toHaveBeenCalledWith({ ...actor, fullName: actor.email });
});
it("supports guest-only installations without falling back to custom auth", async () => {
  state.configured = false;
  expect(await readCustomerActor()).toBeNull();
  expect(state.getClaims).not.toHaveBeenCalled();
});
it("redirects missing identity using only an allowed destination", async () => {
  await expect(requireCustomer("/checkout")).rejects.toThrow("redirect:/login?next=%2Fcheckout");
  await expect(requireCustomer("https://foreign.example")).rejects.toThrow("redirect:/login?next=%2Faccount");
});
