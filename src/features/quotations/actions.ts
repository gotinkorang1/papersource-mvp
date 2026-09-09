"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  removeQuoteLine,
  setQuoteLineQuantity,
} from "@/features/quotations/repository";
import { RfqError, submitGuestRfq } from "@/features/quotations/submit";
import { readCommerceIdentity } from "@/lib/customer/commerce";

const lineSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.coerce.number().int().min(0).max(9_999),
});

export async function updateQuoteQuantityAction(formData: FormData) {
  const parsed = lineSchema.safeParse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) return;
  const sessionId = await readCommerceIdentity(true);
  await setQuoteLineQuantity(sessionId, parsed.data.variantId, parsed.data.quantity);
  revalidatePath("/", "layout");
  revalidatePath("/quote");
  revalidatePath("/request-quote");
  redirect("/quote?notice=updated");
}

export async function removeQuoteLineAction(formData: FormData) {
  const parsedVariantId = z.string().uuid().safeParse(formData.get("variantId"));
  if (!parsedVariantId.success) return;
  const variantId = parsedVariantId.data;
  const sessionId = await readCommerceIdentity(true);
  await removeQuoteLine(sessionId, variantId);
  revalidatePath("/", "layout");
  revalidatePath("/quote");
  revalidatePath("/request-quote");
}

export async function submitRfqAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const identity = await readCommerceIdentity();
  if (!identity.profileId && !identity.sessionId) {
    return { error: "Your session expired. Add items to the quote list and try again." };
  }
  let number: string;
  let token: string;
  let attachmentError = false;
  try {
    const result = await submitGuestRfq({
      sessionId: identity.sessionId,
      formData,
      profileId: identity.profileId,
    });
    number = result.number;
    token = result.token;
    attachmentError = result.attachmentError;
  } catch (error) {
    if (error instanceof RfqError) {
      return { error: error.message };
    }
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? "Check the quotation details." };
    }
    throw error;
  }
  const received = new URLSearchParams({ number });
  if (!identity.profileId) received.set("token", token);
  if (attachmentError) {
    received.set("attachments", "failed");
  }
  // The persistent store shell may survive the redirect; refresh its server
  // snapshot so the submitted draft disappears from the client-side count.
  revalidatePath("/", "layout");
  revalidatePath("/request-quote");
  redirect(`/request-quote/received?${received.toString()}`);
}
