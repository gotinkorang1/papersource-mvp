"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  removeQuoteLine,
  setQuoteLineQuantity,
} from "@/features/quotations/repository";
import { RfqError, submitGuestRfq } from "@/features/quotations/submit";
import { getOrCreateGuestSessionId, readGuestSessionId } from "@/lib/session/guest";

const lineSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.coerce.number().int().min(0).max(9_999),
});

export async function updateQuoteQuantityAction(formData: FormData) {
  const parsed = lineSchema.parse({
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity"),
  });
  const sessionId = await getOrCreateGuestSessionId();
  await setQuoteLineQuantity(sessionId, parsed.variantId, parsed.quantity);
  revalidatePath("/", "layout");
  revalidatePath("/quote");
  revalidatePath("/request-quote");
}

export async function removeQuoteLineAction(formData: FormData) {
  const variantId = z.string().uuid().parse(formData.get("variantId"));
  const sessionId = await getOrCreateGuestSessionId();
  await removeQuoteLine(sessionId, variantId);
  revalidatePath("/", "layout");
  revalidatePath("/quote");
  revalidatePath("/request-quote");
}

export async function submitRfqAction(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const sessionId = await readGuestSessionId();
  if (!sessionId) {
    return { error: "Your session expired. Add items to the quote list and try again." };
  }
  let number: string;
  let token: string;
  try {
    const result = await submitGuestRfq({ sessionId, formData });
    number = result.number;
    token = result.token;
  } catch (error) {
    if (error instanceof RfqError) {
      return { error: error.message };
    }
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message ?? "Check the quotation details." };
    }
    throw error;
  }
  redirect(
    `/request-quote/received?number=${encodeURIComponent(number)}&token=${encodeURIComponent(token)}`,
  );
}
