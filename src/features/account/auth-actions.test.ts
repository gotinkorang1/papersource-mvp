import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const boundary = vi.hoisted(() => ({
  auth: { signUp: vi.fn(), signInWithPassword: vi.fn(), getClaims: vi.fn(), signOut: vi.fn(), resetPasswordForEmail: vi.fn(), updateUser: vi.fn() },
  client: vi.fn(), merge: vi.fn(), profile: vi.fn(), revalidate: vi.fn(),
  jar: new Map<string, string>(),
}));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: boundary.client }));
vi.mock("@/lib/customer/profiles", () => ({ synchronizeCustomerProfile: boundary.profile }));
vi.mock("@/features/account/merge", () => ({ mergeGuestCommerce: boundary.merge }));
vi.mock("@/lib/env", () => ({ publicEnv: { NEXT_PUBLIC_SITE_URL: "https://papersourcegh.com" } }));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: (name: string) => boundary.jar.has(name) ? { value: boundary.jar.get(name) } : undefined }) }));
vi.mock("next/cache", () => ({ revalidatePath: boundary.revalidate }));
vi.mock("next/navigation", () => ({ redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); } }));
import { loginCustomerAction, registerCustomerAction, requestPasswordResetAction, updateCustomerPasswordAction, signOutCustomerAction } from "./auth-actions";

const profileId = "18cc3e14-1525-4b7f-b4bd-174d5518461d";
const guestId = "28cc3e14-1525-4b7f-b4bd-174d5518461d";
function form(values: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ email: "ama@example.test", password: "password!", ...values })) data.set(key, value);
  return data;
}
beforeEach(() => {
  vi.resetAllMocks();
  boundary.jar.clear(); boundary.jar.set("ps_sid", guestId);
  boundary.client.mockResolvedValue({ auth: boundary.auth });
  boundary.auth.signInWithPassword.mockResolvedValue({ data: { session: {}, user: { id: "untrusted" } }, error: null });
  boundary.auth.getClaims.mockResolvedValue({ data: { claims: { sub: profileId, email: "ama@example.test", role: "authenticated", is_anonymous: false } }, error: null });
  boundary.auth.signOut.mockResolvedValue({ error: null });
  boundary.profile.mockImplementation(async (identity) => identity);
});

describe("customer auth Server Actions", () => {
  it("validates fields before authentication or basket mutations", async () => {
    expect(await loginCustomerAction({}, form({ email: "bad" }))).toMatchObject({ status: "error", fieldErrors: { email: expect.any(Array) } });
    expect(boundary.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(boundary.merge).not.toHaveBeenCalled();
  });
  it("merges only verified profile and server cookie and redirects outside catch", async () => {
    await expect(loginCustomerAction({}, form({ next: "/checkout", profileId: "forged", sessionId: "forged" }))).rejects.toThrow("REDIRECT:/checkout");
    expect(boundary.merge).toHaveBeenCalledExactlyOnceWith({ profileId, sessionId: guestId });
    expect(boundary.revalidate).toHaveBeenCalledWith("/", "layout");
  });
  it.each(["https://evil.test", "//evil.test", "%2f%2fevil.test", "/admin"])("rejects unsafe return destination %s", async (next) => {
    await expect(loginCustomerAction({}, form({ next }))).rejects.toThrow("REDIRECT:/account");
  });
  it("rejects a malformed cookie rather than merging a submitted identity", async () => {
    boundary.jar.set("ps_sid", "malformed");
    await expect(loginCustomerAction({}, form({ sessionId: guestId }))).rejects.toThrow("REDIRECT:/account");
    expect(boundary.merge).toHaveBeenCalledExactlyOnceWith({ profileId, sessionId: null });
  });
  it("returns only neutral failure state when configuration is absent", async () => {
    boundary.client.mockRejectedValue(new Error("Supabase secret configuration"));
    const result = await loginCustomerAction({}, form());
    expect(result.status).toBe("error");
    expect(JSON.stringify(result)).not.toMatch(/secret|Supabase/);
    expect(boundary.merge).not.toHaveBeenCalled();
  });
  it("does not redirect or merge an unverified provider session", async () => {
    boundary.auth.getClaims.mockResolvedValue({ data: null, error: { message: "private JWT" } });
    expect(await loginCustomerAction({}, form())).toMatchObject({ status: "error" });
    expect(boundary.merge).not.toHaveBeenCalled();
  });
  it("rolls back the new session when merge fails without exposing database details", async () => {
    boundary.merge.mockRejectedValue(new Error("sensitive SQL"));
    const result = await loginCustomerAction({}, form());
    expect(result.status).toBe("error");
    expect(JSON.stringify(result)).not.toContain("SQL");
    expect(boundary.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
  it("waits for signup confirmation without merging, redirecting or returning identity", async () => {
    boundary.auth.signUp.mockResolvedValue({ data: { session: null, user: { id: profileId } }, error: null });
    expect(await registerCustomerAction({}, form({ fullName: "Ama", phone: "" }))).toMatchObject({ status: "success", message: expect.stringMatching(/email/i) });
    expect(boundary.merge).not.toHaveBeenCalled();
  });
  it("merges after immediate signup is verified", async () => {
    boundary.auth.signUp.mockResolvedValue({ data: { session: {}, user: { id: "untrusted" } }, error: null });
    await expect(registerCustomerAction({}, form({ fullName: "Ama", phone: "", next: "/quote" }))).rejects.toThrow("REDIRECT:/quote");
    expect(boundary.merge).toHaveBeenCalledExactlyOnceWith({ profileId, sessionId: guestId });
  });
  it("returns neutral reset-email feedback and does not accept client callback URLs", async () => {
    boundary.auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    expect(await requestPasswordResetAction({}, form({ redirectTo: "https://evil.test" }))).toMatchObject({ status: "success", message: expect.stringMatching(/if.*account/i) });
    expect(boundary.auth.resetPasswordForEmail).toHaveBeenCalledWith("ama@example.test", { redirectTo: "https://papersourcegh.com/auth/confirm?type=recovery" });
  });
  it("requires matching passwords and a verified session for password update", async () => {
    expect(await updateCustomerPasswordAction({}, form({ confirmPassword: "different" }))).toMatchObject({ status: "error", fieldErrors: { confirmPassword: expect.any(Array) } });
    expect(boundary.auth.updateUser).not.toHaveBeenCalled();
    boundary.auth.getClaims.mockResolvedValue({ data: null, error: null });
    expect(await updateCustomerPasswordAction({}, form({ confirmPassword: "password!" }))).toMatchObject({ status: "error" });
    expect(boundary.auth.updateUser).not.toHaveBeenCalled();
  });
  it("confirms password update without returning tokens or identity", async () => {
    boundary.auth.updateUser.mockResolvedValue({ data: { user: { id: profileId } }, error: null });
    expect(await updateCustomerPasswordAction({}, form({ confirmPassword: "password!" }))).toMatchObject({ status: "success", message: expect.stringMatching(/updated/i) });
  });
  it("signs out through Supabase, refreshes navigation and preserves the guest cookie", async () => {
    await expect(signOutCustomerAction()).rejects.toThrow("REDIRECT:/login");
    expect(boundary.auth.signOut).toHaveBeenCalledExactlyOnceWith({ scope: "global" });
    expect(boundary.jar.get("ps_sid")).toBe(guestId);
    expect(boundary.revalidate).toHaveBeenCalledWith("/", "layout");
  });
  it("does not falsely report successful signout on provider failure", async () => {
    boundary.auth.signOut.mockResolvedValue({ error: { message: "provider secret" } });
    await expect(signOutCustomerAction()).rejects.toThrow("REDIRECT:/account?authError=sign-out");
  });
});
