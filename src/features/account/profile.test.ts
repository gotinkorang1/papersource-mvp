import { describe, expect, it, vi } from "vitest";

const update = vi.fn();
vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/client", () => ({ getDb: () => ({ update }) }));

import { saveCustomerProfile } from "./profile";

describe("customer profile persistence", () => {
  it("rejects invalid profile data before touching the database", async () => {
    await expect(saveCustomerProfile({ profileId: "profile", fullName: "", phone: "" })).rejects.toThrow(/check your name/i);
    expect(update).not.toHaveBeenCalled();
  });
});
