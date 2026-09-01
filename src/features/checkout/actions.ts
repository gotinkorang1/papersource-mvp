"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { addressFromFormData } from "@/features/checkout/address";
import { CheckoutError, placeRetailOrder } from "@/features/checkout/place-order";
import {
  removeCartLine,
  setCartLineQuantity,
} from "@/features/cart/repository";
import { readCommerceIdentity } from "@/lib/customer/commerce";

const lineSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.coerce.number().int().min(0).max(9_999),
});

export async function updateCartQuantityAction(formData: FormData) {
  const parsed = lineSchema.parse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity"),
  });
  const sessionId = await readCommerceIdentity(true);
  await setCartLineQuantity(sessionId, parsed.variantId, parsed.quantity);
  revalidatePath("/", "layout");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function removeCartLineAction(formData: FormData) {
  const variantId = z.string().uuid().parse(formData.get("variantId"));
  const sessionId = await readCommerceIdentity(true);
  await removeCartLine(sessionId, variantId);
  revalidatePath("/", "layout");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function placeRetailOrderAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const identity = await readCommerceIdentity();
  if (!identity.profileId && !identity.sessionId) {
    return { error: "Your session expired. Add items to the cart and try again." };
  }
  let number: string;
  try {
    const address = addressFromFormData(formData);
    const order = await placeRetailOrder({
      sessionId: identity.sessionId,
      address,
      profileId: identity.profileId,
    });
    number = order.number;
  } catch (error) {
    if (error instanceof CheckoutError) {
      return { error: error.message };
    }
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? "Check the delivery details." };
    }
    throw error;
  }
  redirect(`/order/${number}`);
}
