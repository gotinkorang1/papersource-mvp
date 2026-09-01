import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ actor: vi.fn(), save: vi.fn(), remove: vi.fn(), setDefault: vi.fn(), saveOrg: vi.fn(), revalidate: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/customer/require", () => ({ requireCustomer: mocks.actor }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/features/account/addresses", async (original) => ({ ...await original<object>(), saveCustomerAddress: mocks.save, removeCustomerAddress: mocks.remove, setDefaultCustomerAddress: mocks.setDefault }));
vi.mock("@/features/account/organisation", () => ({ saveCustomerOrganisation: mocks.saveOrg }));

const profileId = "01111111-1111-4111-8111-111111111111";
const addressId = "02222222-2222-4222-8222-222222222222";
const validAddress = { fullName: "Ama", phone: "0241234567", region: "Greater Accra", cityTown: "Accra", areaSuburb: "", streetLandmark: "", ghanapostGps: "", deliveryInstructions: "", deliveryArea: "accra" };
const form = (values: Record<string, string>) => { const data = new FormData(); Object.entries(values).forEach(([key, value]) => data.set(key, value)); return data; };
async function actions() {
  const actionModule = await import("./actions").catch(() => null);
  expect(actionModule, "Server Actions must validate and scope every mutation").not.toBeNull();
  return actionModule!;
}

beforeEach(() => { vi.clearAllMocks(); mocks.actor.mockResolvedValue({ profileId, fullName: "Ama", email: "ama@example.test", phone: null }); });

describe("account Server Action boundary", () => {
  it("does not accept a form-supplied profile identity", async () => {
    const result = await (await actions()).saveAddressAction({}, form({ ...validAddress, profileId: addressId, isDefault: "true" }));
    expect(result.success).toBe(true);
    expect(mocks.save).toHaveBeenCalledWith({ profileId, addressId: undefined, values: validAddress, isDefault: true });
  });
  it("returns associated field validation without querying the DAL", async () => {
    const result = await (await actions()).saveAddressAction({}, form({ ...validAddress, phone: "1" }));
    expect(result.errors?.phone?.length).toBeGreaterThan(0);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("rejects malformed object identifiers before delete or default changes", async () => {
    const api = await actions();
    expect((await api.removeAddressAction({}, form({ addressId: "bad" }))).success).not.toBe(true);
    expect((await api.defaultAddressAction({}, form({ addressId: "bad" }))).success).not.toBe(true);
    expect(mocks.remove).not.toHaveBeenCalled();
    expect(mocks.setDefault).not.toHaveBeenCalled();
  });
  it("uses verified identity for deletion and default changes", async () => {
    const api = await actions();
    await api.removeAddressAction({}, form({ addressId, profileId: "forged" }));
    await api.defaultAddressAction({}, form({ addressId, profileId: "forged" }));
    expect(mocks.remove).toHaveBeenCalledWith(profileId, addressId);
    expect(mocks.setDefault).toHaveBeenCalledWith(profileId, addressId);
  });
  it("preserves an unauthenticated redirect without catching it", async () => {
    mocks.actor.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect((await actions()).saveAddressAction({}, form(validAddress))).rejects.toThrow("NEXT_REDIRECT");
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("does not disclose database details in form errors", async () => {
    mocks.save.mockRejectedValueOnce(new Error("postgres://private credential secret"));
    const result = await (await actions()).saveAddressAction({}, form(validAddress));
    expect(result.message).toBeTruthy();
    expect(JSON.stringify(result)).not.toMatch(/postgres|credential|secret/);
  });
  it("rejects invalid organisation types and ignores forged organisation identifiers", async () => {
    const api = await actions();
    const invalid = await api.saveOrganisationAction({}, form({ name: "School", type: "admin", email: "", phone: "" }));
    expect(invalid.errors?.type?.length).toBeGreaterThan(0);
    expect(mocks.saveOrg).not.toHaveBeenCalled();
    await api.saveOrganisationAction({}, form({ name: "School", type: "school", email: "", phone: "", organizationId: "forged" }));
    expect(mocks.saveOrg).toHaveBeenCalledWith({ profileId, name: "School", type: "school", email: "", phone: "" });
  });
});
