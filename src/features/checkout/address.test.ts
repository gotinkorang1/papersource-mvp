import { describe, expect, it } from "vitest";
import { addressFromFormData } from "./address";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("addressFromFormData", () => {
  it("accepts shop pickup without delivery location fields", () => {
    const address = addressFromFormData(form({
      fullName: "Ama Mensah",
      phone: "0555001313",
      deliveryArea: "pickup",
      email: "ama@example.com",
    }));

    expect(address.deliveryArea).toBe("pickup");
    expect(address.region).toBe("");
    expect(address.cityTown).toBe("");
  });

  it("still requires a region and city for delivery", () => {
    expect(() => addressFromFormData(form({
      fullName: "Ama Mensah",
      phone: "0555001313",
      deliveryArea: "accra",
      email: "ama@example.com",
    }))).toThrow(/Region is required|City \/ town is required/);
  });
});
