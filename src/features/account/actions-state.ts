import { z } from "zod";
import { ghanaAddressSchema } from "@/features/checkout/address";
import { organizationTypeEnum } from "@/lib/db/schema/enums";

export type AccountActionState = {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[] | undefined>;
};

export const personalAddressSchema = ghanaAddressSchema.omit({ email: true }).extend({
  fullName: z.string().trim().min(1, "Full name is required").max(160),
  phone: z.string().trim().min(9, "Enter a phone number of at least 9 characters").max(30),
  region: z.string().trim().min(1, "Region is required").max(100),
  cityTown: z.string().trim().min(1, "City / town is required").max(100),
  areaSuburb: z.string().trim().max(200),
  streetLandmark: z.string().trim().max(500),
  ghanapostGps: z.string().trim().max(50),
  deliveryInstructions: z.string().trim().max(1000),
});

export const organisationSchema = z.object({
  name: z.string().trim().min(1, "Organisation name is required").max(200),
  type: z.enum(organizationTypeEnum.enumValues, { error: "Select a valid organisation type" }),
  email: z.union([z.string().trim().email("Enter a valid email").max(254), z.literal("")]),
  phone: z.string().trim().max(30),
});

export const customerProfileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(160),
  phone: z.string().trim().max(30, "Phone number is too long"),
});
