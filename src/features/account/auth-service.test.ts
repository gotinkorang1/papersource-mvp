import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
vi.mock("server-only", () => ({}));
import { createCustomerAuthService } from "./auth-service";

const actor = { profileId: "18cc3e14-1525-4b7f-b4bd-174d5518461d", email: "ama@example.test", fullName: "Ama", phone: null };
const registration = { email: " AMA@EXAMPLE.TEST ", password: "  password!  ", fullName: " Ama ", phone: " 0241234567 ", next: "/checkout" };
const claims = { sub: actor.profileId, email: actor.email, role: "authenticated", is_anonymous: false, user_metadata: { full_name: "Ama" } };
const auth = {
  signUp: vi.fn(), signInWithPassword: vi.fn(), verifyOtp: vi.fn(),
  resetPasswordForEmail: vi.fn(), updateUser: vi.fn(), signOut: vi.fn(), getClaims: vi.fn(),
};
const synchronizeProfile = vi.fn();
function service(siteUrl = "https://papersourcegh.com") {
  return createCustomerAuthService({ auth: auth as unknown as SupabaseClient["auth"], siteUrl, synchronizeProfile });
}

beforeEach(() => {
  vi.resetAllMocks();
  auth.signUp.mockResolvedValue({ data: { user: null, session: null }, error: null });
  auth.signInWithPassword.mockResolvedValue({ data: { user: { id: "untrusted-response-id" }, session: {} }, error: null });
  auth.verifyOtp.mockResolvedValue({ data: { user: { id: "untrusted-response-id" }, session: {} }, error: null });
  auth.getClaims.mockResolvedValue({ data: { claims }, error: null });
  auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
  auth.updateUser.mockResolvedValue({ data: { user: { id: actor.profileId } }, error: null });
  auth.signOut.mockResolvedValue({ error: null });
  synchronizeProfile.mockImplementation(async (identity) => ({ ...identity, fullName: "Saved name" }));
});

describe("customer Auth operations", () => {
  it("normalizes registration display input but preserves password bytes and waits for confirmation", async () => {
    expect(await service().register(registration)).toEqual({ status: "email_sent" });
    expect(auth.signUp).toHaveBeenCalledWith({
      email: "ama@example.test", password: "  password!  ",
      options: { data: { full_name: "Ama", phone: "0241234567" }, emailRedirectTo: "https://papersourcegh.com/auth/confirm?type=email&next=%2Fcheckout" },
    });
    expect(auth.getClaims).not.toHaveBeenCalled();
    expect(synchronizeProfile).not.toHaveBeenCalled();
  });

  it.each([
    { email: "not-email" }, { email: `${"a".repeat(255)}@example.test` },
    { password: "short" }, { password: "a".repeat(129) }, { fullName: " " },
    { fullName: "a".repeat(121) }, { phone: "1".repeat(31) }, { email: null },
  ])("rejects invalid registration before provider side effects: %j", async (invalid) => {
    expect(await service().register({ ...registration, ...invalid })).toMatchObject({ status: "error", fieldErrors: expect.any(Object) });
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("gives a neutral result for an already registered email without reading profiles", async () => {
    auth.signUp.mockResolvedValue({ data: { user: null, session: null }, error: { code: "user_already_exists", message: "private provider detail" } });
    expect(await service().register(registration)).toEqual({ status: "email_sent" });
    expect(synchronizeProfile).not.toHaveBeenCalled();
  });

  it("verifies immediate signup sessions before profile synchronization", async () => {
    auth.signUp.mockResolvedValue({ data: { user: { id: "forged" }, session: {} }, error: null });
    expect(await service().register(registration)).toEqual({ status: "signed_in", customer: { ...actor, fullName: "Saved name" }, next: "/checkout" });
    expect(synchronizeProfile).toHaveBeenCalledWith(actor);
  });

  it.each(["https://evil.test", "//evil.test", "/admin", "%2f%2fevil.test"])("constrains signup and login destinations: %s", async (next) => {
    await service().register({ ...registration, next });
    expect(auth.signUp.mock.calls[0][0].options.emailRedirectTo).toBe("https://papersourcegh.com/auth/confirm?type=email&next=%2Faccount");
    expect(await service().login({ ...registration, next })).toMatchObject({ status: "signed_in", next: "/account" });
  });

  it.each(["http://evil.test", "https://user:pass@example.test", "https://example.test/path", "https://example.test?next=bad", "https://example.test/#token", "not a URL"])("rejects unsafe callback configuration: %s", (siteUrl) => {
    expect(() => service(siteUrl)).toThrow();
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("supports local callback origins", async () => {
    await service("http://localhost:3000").requestPasswordReset({ email: "AMA@EXAMPLE.TEST" });
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("ama@example.test", { redirectTo: "http://localhost:3000/auth/confirm?type=recovery" });
  });

  it("signs in using the verified subject, never the raw session user", async () => {
    expect(await service().login(registration)).toEqual({ status: "signed_in", customer: { ...actor, fullName: "Saved name" }, next: "/checkout" });
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: actor.email, password: registration.password });
    expect(synchronizeProfile).toHaveBeenCalledWith(actor);
  });

  it.each([{ email: "bad", password: "x" }, { email: actor.email, password: "" }, { email: actor.email, password: "x".repeat(129) }, null])("validates login: %j", async (input) => {
    expect(await service().login(input)).toMatchObject({ status: "error" });
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it.each(["invalid_credentials", "email_not_confirmed", "user_banned"])("hides provider login details: %s", async (code) => {
    auth.signInWithPassword.mockResolvedValue({ data: { session: null, user: null }, error: { code, message: "sensitive" } });
    expect(await service().login(registration)).toEqual({ status: "error", message: "Could not sign in. Check your details and try again." });
    expect(synchronizeProfile).not.toHaveBeenCalled();
  });

  it("does not leave a newly established session after profile synchronization fails", async () => {
    synchronizeProfile.mockRejectedValue(new Error("sensitive SQL"));
    expect(await service().login(registration)).toEqual({ status: "error", message: "Could not sign in. Check your details and try again." });
    expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("rejects unverified sessions and attempts cleanup even if cleanup fails", async () => {
    auth.getClaims.mockResolvedValue({ data: null, error: { message: "bad JWT" } });
    auth.signOut.mockRejectedValue(new Error("network detail"));
    expect(await service().login(registration)).toMatchObject({ status: "error" });
    expect(synchronizeProfile).not.toHaveBeenCalled();
    expect(auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("confirms token hashes and returns only a verified customer DTO", async () => {
    expect(await service().confirm({ tokenHash: "valid-token-hash", type: "email", next: "/cart" })).toEqual({ status: "signed_in", customer: { ...actor, fullName: "Saved name" }, next: "/cart" });
    expect(auth.verifyOtp).toHaveBeenCalledWith({ token_hash: "valid-token-hash", type: "email" });
  });

  it("forces recovery to password reset regardless of supplied next", async () => {
    expect(await service().confirm({ tokenHash: "valid-token-hash", type: "recovery", next: "/admin" })).toMatchObject({ status: "signed_in", next: "/reset-password" });
  });

  it.each([{ tokenHash: "", type: "email" }, { tokenHash: "a".repeat(2049), type: "email" }, { tokenHash: "token", type: "invite" }, { tokenHash: "token", type: "sms" }, null])("rejects invalid confirmation before exchange: %j", async (input) => {
    expect(await service().confirm(input)).toMatchObject({ status: "error" });
    expect(auth.verifyOtp).not.toHaveBeenCalled();
  });

  it("rejects expired or reused confirmation without returning provider error details", async () => {
    auth.verifyOtp.mockResolvedValue({ data: { session: null, user: null }, error: { message: "token secret" } });
    expect(await service().confirm({ tokenHash: "reused", type: "email" })).toEqual({ status: "error", message: "This link is invalid or expired. Request a new email." });
    expect(synchronizeProfile).not.toHaveBeenCalled();
  });

  it("returns a neutral reset-email result and ignores submitted callback URLs", async () => {
    expect(await service().requestPasswordReset({ email: " UNKNOWN@EXAMPLE.TEST ", redirectTo: "https://evil.test" })).toEqual({ status: "email_sent" });
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("unknown@example.test", { redirectTo: "https://papersourcegh.com/auth/confirm?type=recovery" });
  });

  it("rejects malformed reset requests before sending email", async () => {
    expect(await service().requestPasswordReset({ email: "invalid" })).toMatchObject({ status: "error" });
    expect(auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it.each([{ password: "short", confirmPassword: "short" }, { password: "valid-password", confirmPassword: "different" }])("rejects invalid new passwords: %j", async (input) => {
    expect(await service().updatePassword(input)).toMatchObject({ status: "error", fieldErrors: expect.any(Object) });
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it("requires verified identity before password mutation", async () => {
    auth.getClaims.mockResolvedValue({ data: null, error: null });
    expect(await service().updatePassword({ password: "valid-password", confirmPassword: "valid-password" })).toMatchObject({ status: "error" });
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it("updates the password via Supabase without returning tokens or user records", async () => {
    expect(await service().updatePassword({ password: " new-password ", confirmPassword: " new-password " })).toEqual({ status: "password_updated" });
    expect(auth.updateUser).toHaveBeenCalledWith({ password: " new-password " });
    expect(synchronizeProfile).not.toHaveBeenCalled();
  });

  it("signs out globally through Supabase", async () => {
    expect(await service().signOut()).toEqual({ status: "signed_out" });
    expect(auth.signOut).toHaveBeenCalledWith({ scope: "global" });
  });

  it("does not report sign-out success when revocation fails", async () => {
    auth.signOut.mockResolvedValue({ error: { message: "private detail" } });
    expect(await service().signOut()).toEqual({ status: "error", message: "Could not sign out. Please try again." });
  });

  it.each([
    ["register", "signUp"], ["requestPasswordReset", "resetPasswordForEmail"], ["updatePassword", "updateUser"],
  ] as const)("contains resolved provider errors from %s", async (operation, providerMethod) => {
    auth[providerMethod].mockResolvedValue({ data: { user: null, session: null }, error: { code: "unexpected_failure", message: "private provider detail" } });
    const result = await service()[operation]({ ...registration, confirmPassword: registration.password });
    expect(result).toMatchObject({ status: "error" });
    expect(JSON.stringify(result)).not.toContain("private provider detail");
    expect(synchronizeProfile).not.toHaveBeenCalled();
  });

  it("contains password-update transport failures after identity verification succeeds", async () => {
    auth.updateUser.mockRejectedValue(new Error("private transport detail"));
    const result = await service().updatePassword({ password: "new-password", confirmPassword: "new-password" });
    expect(result).toEqual({ status: "error", message: "Could not update your password. Request a new reset email and try again." });
    expect(auth.updateUser).toHaveBeenCalledWith({ password: "new-password" });
  });

  it.each(["register", "login", "confirm", "requestPasswordReset", "updatePassword", "signOut"] as const)("contains unexpected provider failures in %s", async (operation) => {
    for (const method of Object.values(auth)) method.mockRejectedValue(new Error("secret token and provider detail"));
    const input = { ...registration, tokenHash: "token", type: "email", confirmPassword: registration.password };
    const result = await service()[operation](input);
    expect(result).toMatchObject({ status: "error" });
    expect(JSON.stringify(result)).not.toMatch(/secret token|provider detail/);
  });
});
