import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { readVerifiedCustomerIdentity } from "./identity";

const sub = "a7105cc2-81b4-44e5-bdf3-87f929c1c501";
const claims = { sub, email: "Customer@Example.com", role: "authenticated", is_anonymous: false };
const reader = (value: unknown, error: unknown = null) => ({
  getClaims: async () => ({ data: value === null ? null : { claims: value }, error }),
});

describe("verified customer identity", () => {
  it("uses verified subject/email and ignores metadata identity or roles", async () => {
    expect(await readVerifiedCustomerIdentity(reader({ ...claims, user_metadata: {
      sub: "another-profile", email: "admin@example.com", role: "admin", full_name: "  Ama  ", phone: " 0241234567 ",
    } }))).toEqual({ profileId: sub, email: "customer@example.com", fullName: "Ama", phone: "0241234567" });
  });
  it.each([null, {}, { ...claims, sub: "bad-id" }, { ...claims, email: undefined },
    { ...claims, email: "bad-email" }, { ...claims, role: "service_role" },
    { ...claims, is_anonymous: true }, { user_metadata: claims },
  ])("denies absent or invalid verified claims: %j", async (value) => {
    expect(await readVerifiedCustomerIdentity(reader(value))).toBeNull();
  });
  it("denies claims accompanied by a verification error", async () => {
    expect(await readVerifiedCustomerIdentity(reader(claims, new Error("invalid signature")))).toBeNull();
  });
  it("does not hide transport failures as a valid identity", async () => {
    await expect(readVerifiedCustomerIdentity({ getClaims: async () => { throw new Error("offline"); } })).rejects.toThrow("offline");
  });
  it("uses safe defaults for malformed display metadata", async () => {
    expect(await readVerifiedCustomerIdentity(reader({ ...claims, user_metadata: { full_name: {}, phone: [] } })))
      .toEqual({ profileId: sub, email: "customer@example.com", fullName: "customer@example.com", phone: null });
  });
  it("bounds display-only fields", async () => {
    const identity = await readVerifiedCustomerIdentity(reader({ ...claims, user_metadata: { full_name: "a".repeat(300), phone: "1".repeat(100) } }));
    expect(identity?.fullName).toHaveLength(120);
    expect(identity?.phone).toHaveLength(30);
  });
});
