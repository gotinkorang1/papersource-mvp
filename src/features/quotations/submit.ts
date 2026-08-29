import { and, eq } from "drizzle-orm";
import { addressFromFormData } from "@/features/checkout/address";
import { getDeliveryZoneByCode } from "@/features/delivery/queries";
import { zoneCodeForDeliveryArea } from "@/features/delivery/fees";
import { resolveDeliveryFee } from "@/features/delivery/fees";
import { getDraftQuote, listQuoteLines } from "@/features/quotations/repository";
import { assertQuoteTransition, QuoteTransitionError } from "@/features/quotations/transitions";
import { getDb } from "@/lib/db/client";
import { nextDocumentNumber } from "@/lib/db/numbers";
import {
  organizations,
  quoteAccessTokens,
  quoteEvents,
  quoteItems,
  quotes,
} from "@/lib/db/schema";
import { notifyQuoteSubmitted } from "@/lib/email";
import { inclusiveVatBreakdown } from "@/lib/tax";
import {
  assertAllowedDocument,
  DocumentUploadError,
  MAX_DOCUMENTS_PER_RFQ,
} from "@/lib/documents/mime";
import { attachQuoteDocumentsFromForm } from "@/features/quotations/documents";
import { z } from "zod";

const rfqSchema = z.object({
  organizationName: z.string().trim().min(1, "Organisation name is required"),
  organizationType: z.enum([
    "business",
    "school",
    "government",
    "ngo",
    "hospital",
    "church",
    "university",
    "retailer",
    "other",
  ]),
  contactName: z.string().trim().min(1, "Contact person is required"),
  email: z.string().email("A valid email is required"),
  requestedDeliveryDate: z.string().trim(),
  notes: z.string().trim(),
});

export class RfqError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RfqError";
  }
}

export async function submitGuestRfq(input: {
  sessionId: string;
  formData: FormData;
}) {
  const draft = await getDraftQuote(input.sessionId);
  const lines = await listQuoteLines(input.sessionId);
  if (!draft || lines.length === 0) {
    throw new RfqError("Your quote list is empty.");
  }

  try {
    assertQuoteTransition(draft.status, "submitted");
  } catch (error) {
    if (error instanceof QuoteTransitionError) {
      throw new RfqError(error.message);
    }
    throw error;
  }

  const address = addressFromFormData(input.formData);
  const details = rfqSchema.parse({
    organizationName: input.formData.get("organizationName"),
    organizationType: input.formData.get("organizationType") ?? "business",
    contactName: input.formData.get("contactName") ?? address.fullName,
    email: input.formData.get("email"),
    requestedDeliveryDate: input.formData.get("requestedDeliveryDate") ?? "",
    notes: input.formData.get("notes") ?? "",
  });

  const files = input.formData
    .getAll("documents")
    .filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length > MAX_DOCUMENTS_PER_RFQ) {
    throw new RfqError("Attach up to five files.");
  }
  try {
    for (const file of files) {
      assertAllowedDocument({
        filename: file.name,
        mime: file.type,
        size: file.size,
      });
    }
  } catch (error) {
    if (error instanceof DocumentUploadError) {
      throw new RfqError(error.message);
    }
    throw error;
  }

  const zone = await getDeliveryZoneByCode(
    zoneCodeForDeliveryArea(address.deliveryArea),
  );
  if (!zone) {
    throw new RfqError("That delivery area is not available yet.");
  }

  const goodsTotal = lines.reduce(
    (sum, line) => sum + (line.unitPricePesewas ?? 0) * line.quantity,
    0,
  );
  const delivery = resolveDeliveryFee(
    {
      feeMode: zone.feeMode,
      basePrice: zone.basePrice,
      freeShippingThreshold: zone.freeShippingThreshold,
    },
    goodsTotal,
  );
  const tax = inclusiveVatBreakdown(goodsTotal + delivery.feePesewas);
  const number = await nextDocumentNumber("quote");
  const token = crypto.randomUUID();

  const db = getDb();
  const [organization] = await db
    .insert(organizations)
    .values({
      name: details.organizationName,
      email: details.email,
      phone: address.phone,
      type: details.organizationType,
    })
    .returning();

  if (!organization) {
    throw new RfqError("Could not save the organisation.");
  }

  await db.transaction(async (tx) => {
    for (const line of lines) {
      await tx
        .update(quoteItems)
        .set({
          nameSnapshot: line.name,
          skuSnapshot: line.sku,
          specSnapshot: line.specLine,
          quantity: line.quantity,
          unitPrice: line.unitPricePesewas,
          lineTotal:
            line.unitPricePesewas === null
              ? null
              : line.unitPricePesewas * line.quantity,
        })
        .where(
          and(
            eq(quoteItems.quoteId, draft.id),
            eq(quoteItems.variantId, line.id),
          ),
        );
    }

    await tx
      .update(quotes)
      .set({
        number,
        status: "submitted",
        guestEmail: details.email,
        guestPhone: address.phone,
        contactName: details.contactName,
        organizationId: organization.id,
        deliveryZoneId: zone.id,
        requestedDeliveryDate: details.requestedDeliveryDate
          ? details.requestedDeliveryDate
          : null,
        notes: details.notes,
        addressSnapshot: { ...address, email: details.email },
        goodsTotal,
        taxTotal: tax.taxTotal,
        taxJson: tax.taxJson,
        deliveryFee: delivery.feePesewas,
        deliveryFeeStatus: delivery.status,
        grandTotal: goodsTotal + delivery.feePesewas,
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, draft.id));

    await tx.insert(quoteEvents).values({
      quoteId: draft.id,
      fromStatus: "draft",
      toStatus: "submitted",
      actorType: "guest",
      payload: { number, organizationId: organization.id },
    });

    await tx.insert(quoteAccessTokens).values({
      quoteId: draft.id,
      token,
    });
  });

  let attachmentError = false;
  try {
    await attachQuoteDocumentsFromForm({
      quoteId: draft.id,
      organizationId: organization.id,
      formData: input.formData,
    });
  } catch (error) {
    console.error("[documents]", error);
    attachmentError = files.length > 0;
  }

  await notifyQuoteSubmitted({
    quoteId: draft.id,
    number,
    token,
    email: details.email,
    contactName: details.contactName,
    organizationName: details.organizationName,
  });

  return { number, token, attachmentError };
}
