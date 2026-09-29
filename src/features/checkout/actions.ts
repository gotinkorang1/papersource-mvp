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
import { captureServerException } from "@/lib/observability/sentry";

const lineSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.coerce.number().int().min(0).max(9_999),
});

export async function updateCartQuantityAction(formData: FormData) {
  const parsed = lineSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) redirect("/cart?warning=Enter a valid quantity.");
  try {
    const sessionId = await readCommerceIdentity(true);
    await setCartLineQuantity(sessionId, parsed.data.variantId, parsed.data.quantity);
  } catch (error) {
    captureServerException(error, { operation: "update_cart_quantity", dependency: "database" });
    redirect("/cart?warning=We could not update that item. Please try again.");
  }
  revalidatePath("/", "layout");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  redirect(`/cart?notice=${parsed.data.quantity === 0 ? "removed" : "updated"}`);
}

export async function removeCartLineAction(formData: FormData) {
  const parsedVariantId = z.string().uuid().safeParse(formData.get("variantId"));
  if (!parsedVariantId.success) redirect("/cart?warning=That cart item could not be found.");
  const variantId = parsedVariantId.data;
  try {
    const sessionId = await readCommerceIdentity(true);
    await removeCartLine(sessionId, variantId);
  } catch (error) {
    captureServerException(error, { operation: "remove_cart_line", dependency: "database" });
    redirect("/cart?warning=We could not remove that item. Please try again.");
  }
  revalidatePath("/", "layout");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  redirect("/cart?notice=removed");
}

export async function placeRetailOrderAction(
  _prev: { error: string; fieldErrors?: Record<string, string[]> } | null,
  formData: FormData,
): Promise<{ error: string; fieldErrors?: Record<string, string[]> } | null> {
  let number: string;
  try {
    // Keep identity resolution inside the guarded path so cookie/session failures
    // return the same recoverable checkout state as other server-side failures.
    const identity = await readCommerceIdentity();
    if (!identity.profileId && !identity.sessionId) {
      return { error: "Your session expired. Add items to the cart and try again." };
    }
    const address = addressFromFormData(formData);
    const order = await placeRetailOrder({
      sessionId: identity.sessionId,
      address,
      profileId: identity.profileId,
    });
    number = order.number;
  } catch (error) {
    // Server actions can load the same module through separate server bundles;
    // keep the name check as a safe fallback so expected checkout errors do not
    // become the generic message.
    if (error instanceof CheckoutError || (error instanceof Error && error.name === "CheckoutError")) {
      return { error: error.message };
    }
    if (error instanceof z.ZodError) {
      return { error: "Check the highlighted delivery details.", fieldErrors: error.flatten().fieldErrors as Record<string, string[]> };
    }
    const details = error instanceof Error ? error : new Error(String(error));
    const databaseCode = (error as { code?: unknown; cause?: { code?: unknown } })?.code
      ?? (error as { cause?: { code?: unknown } })?.cause?.code;
    // Keep customer data out of logs while preserving enough context to
    // diagnose hosted checkout failures from the production runtime logs.
    console.error("[checkout] order placement failed", {
      name: details.name,
      message: details.message,
      code: typeof databaseCode === "string" ? databaseCode : undefined,
    });
    captureServerException(error, {
      operation: "place_retail_order",
      dependency: "database",
      extra: {
        error_name: details.name,
        database_code: typeof databaseCode === "string" ? databaseCode : undefined,
      },
    });
    return { error: "We could not place your order right now. Please review your details and try again." };
  }
  redirect(`/order/${number}`);
}
