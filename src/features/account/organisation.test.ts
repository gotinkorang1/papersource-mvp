import { describe, expect, it, vi } from "vitest";
import { saveCustomerOrganisation } from "./organisation";
import { AccountError } from "./addresses";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/client", () => ({ getDb: () => { throw new Error("Database must not receive invalid organisation input"); } }));

describe("organisation input boundary", () => {
  it.each(["administrator", "", "BUSINESS"])("rejects unsupported organisation type %s", async (type) => {
    await expect(saveCustomerOrganisation({ profileId: "profile", name: "School", type, email: "", phone: "" })).rejects.toBeInstanceOf(AccountError);
  });
  it("rejects invalid optional email", async () => {
    await expect(saveCustomerOrganisation({ profileId: "profile", name: "School", type: "school", email: "not-an-email", phone: "" })).rejects.toBeInstanceOf(AccountError);
  });
});
