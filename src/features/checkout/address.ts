import { z } from "zod";
import type { AddressSnapshot } from "@/lib/db/schema/identity";

export const ghanaAddressSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().min(9, "Phone number is required"),
  region: z.string().trim().min(1, "Region is required"),
  cityTown: z.string().trim().min(1, "City / town is required"),
  areaSuburb: z.string().trim(),
  streetLandmark: z.string().trim(),
  ghanapostGps: z.string().trim(),
  deliveryInstructions: z.string().trim(),
  deliveryArea: z.enum(["accra", "tema", "other"]),
  email: z.union([z.string().trim().email(), z.literal("")]),
});

export function addressFromFormData(formData: FormData): AddressSnapshot {
  return ghanaAddressSchema.parse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    region: formData.get("region"),
    cityTown: formData.get("cityTown"),
    areaSuburb: formData.get("areaSuburb") ?? "",
    streetLandmark: formData.get("streetLandmark") ?? "",
    ghanapostGps: formData.get("ghanapostGps") ?? "",
    deliveryInstructions: formData.get("deliveryInstructions") ?? "",
    deliveryArea: formData.get("deliveryArea") ?? "accra",
    email: formData.get("email") ?? "",
  });
}
