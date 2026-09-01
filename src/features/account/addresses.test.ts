import { describe, expect, it, vi } from "vitest";
import { AccountError, saveCustomerAddress } from "./addresses";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/client", () => ({ getDb: () => { throw new Error("Database must not receive invalid address input"); } }));

const values = {
  fullName: "Ama Mensah", phone: "0241234567", region: "Greater Accra", cityTown: "Accra",
  areaSuburb: "", streetLandmark: "", ghanapostGps: "", deliveryInstructions: "", deliveryArea: "accra" as const,
};

describe("saved address input boundary", () => {
  it("rejects a short phone before opening a database connection", async () => {
    await expect(saveCustomerAddress({ profileId: "profile", values: { ...values, phone: "1" }, isDefault: false })).rejects.toBeInstanceOf(AccountError);
  });
  it("rejects forged delivery areas before opening a database connection", async () => {
    await expect(saveCustomerAddress({ profileId: "profile", values: { ...values, deliveryArea: "foreign" as "accra" }, isDefault: false })).rejects.toBeInstanceOf(AccountError);
  });
});
