"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCustomer } from "@/lib/customer/require";
import { AccountError, removeCustomerAddress, saveCustomerAddress, setDefaultCustomerAddress } from "./addresses";
import { saveCustomerOrganisation } from "./organisation";
import { saveCustomerProfile } from "./profile";
import { customerProfileSchema, organisationSchema, personalAddressSchema, type AccountActionState } from "./actions-state";

const addressMutationSchema = personalAddressSchema.extend({
  addressId: z.union([z.uuid(), z.literal("")]).optional(),
  isDefault: z.enum(["true", "false"]).default("false"),
});
const addressIdSchema = z.uuid();
function failure(error: unknown): AccountActionState {
  return { message: error instanceof AccountError ? error.message : "We could not save your changes. Please try again." };
}

export async function saveAddressAction(_previous: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const actor = await requireCustomer("/account/addresses");
  const parsed = addressMutationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, message: "Check the highlighted address fields." };
  const { addressId, isDefault, ...values } = parsed.data;
  try {
    await saveCustomerAddress({ profileId: actor.profileId, addressId: addressId || undefined, values, isDefault: isDefault === "true" });
  } catch (error) { return failure(error); }
  revalidatePath("/account", "layout");
  revalidatePath("/checkout");
  return { success: true, message: "Address saved." };
}

export async function removeAddressAction(_previous: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const actor = await requireCustomer("/account/addresses");
  const parsed = addressIdSchema.safeParse(formData.get("addressId"));
  if (!parsed.success) return { message: "That address was not found." };
  try { await removeCustomerAddress(actor.profileId, parsed.data); }
  catch (error) { return failure(error); }
  revalidatePath("/account", "layout");
  revalidatePath("/checkout");
  return { success: true, message: "Address removed." };
}

export async function defaultAddressAction(_previous: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const actor = await requireCustomer("/account/addresses");
  const parsed = addressIdSchema.safeParse(formData.get("addressId"));
  if (!parsed.success) return { message: "That address was not found." };
  try { await setDefaultCustomerAddress(actor.profileId, parsed.data); }
  catch (error) { return failure(error); }
  revalidatePath("/account", "layout");
  revalidatePath("/checkout");
  return { success: true, message: "Default address updated." };
}

export async function saveOrganisationAction(_previous: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const actor = await requireCustomer("/account/organisation");
  const parsed = organisationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, message: "Check the highlighted organisation fields." };
  try { await saveCustomerOrganisation({ profileId: actor.profileId, ...parsed.data }); }
  catch (error) { return failure(error); }
  revalidatePath("/account", "layout");
  revalidatePath("/request-quote");
  return { success: true, message: "Organisation saved." };
}

export async function saveCustomerProfileAction(_previous: AccountActionState, formData: FormData): Promise<AccountActionState> {
  const actor = await requireCustomer("/account/profile");
  const parsed = customerProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, message: "Check your profile details." };
  try { await saveCustomerProfile({ profileId: actor.profileId, ...parsed.data }); }
  catch (error) { return failure(error); }
  revalidatePath("/account", "layout");
  revalidatePath("/checkout");
  return { success: true, message: "Profile saved." };
}
