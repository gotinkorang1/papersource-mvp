import { eq } from "drizzle-orm";
import { retailCheckoutBlocked } from "@/features/checkout/eligibility";
import { resolveUnitPrice } from "@/features/catalogue/pricing";
import { loadSellableVariant } from "@/features/catalogue/variant-context";
import { listCartLines } from "@/features/cart/repository";
import { resolveDeliveryFee } from "@/features/delivery/fees";
import { getDeliveryZoneByCode } from "@/features/delivery/queries";
import { zoneCodeForDeliveryArea } from "@/features/delivery/fees";
import { getDb } from "@/lib/db/client";
import { nextDocumentNumber } from "@/lib/db/numbers";
import { inventory, orderItems, orders } from "@/lib/db/schema";
import type { AddressSnapshot } from "@/lib/db/schema/identity";
import { notifyOrderPlaced } from "@/lib/email";
import { inclusiveVatBreakdown } from "@/lib/tax";
import { getStoreSettings } from "@/features/settings/admin";

export class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutError";
  }
}

export async function placeRetailOrder(input: {
  sessionId: string | null;
  address: AddressSnapshot;
  profileId?: string | null;
}) {
  const lines = await listCartLines({ sessionId: input.sessionId, profileId: input.profileId ?? null });
  if (lines.length === 0) {
    throw new CheckoutError("Your cart is empty.");
  }
  if (!input.address.email) {
    throw new CheckoutError("Email is required for the order receipt and Paystack.");
  }

  const zone = await getDeliveryZoneByCode(
    zoneCodeForDeliveryArea(input.address.deliveryArea),
  );
  if (!zone) {
    throw new CheckoutError("That delivery area is not available yet.");
  }

  const db = getDb();
  const priced: {
    variantId: string;
    name: string;
    sku: string;
    spec: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[] = [];
  for (const line of lines) {
    const context = await loadSellableVariant(line.id);
    if (!context) {
      throw new CheckoutError(`${line.name} is no longer available.`);
    }

    const [stock] = await db
      .select()
      .from(inventory)
      .where(eq(inventory.variantId, line.id))
      .limit(1);
    const sellable = (stock?.onHand ?? 0) - (stock?.reserved ?? 0);
    if (sellable < line.quantity) {
      throw new CheckoutError(
        `${line.name} does not have enough stock for checkout.`,
      );
    }

    const resolved = resolveUnitPrice({
      quantity: line.quantity,
      baseUnitPricePesewas: context.variant.baseUnitPrice,
      tiers: context.tiers,
    });
    if (retailCheckoutBlocked(resolved) || resolved.unitPricePesewas === null) {
      throw new CheckoutError(
        `${line.name} needs a quotation at this quantity. Use Add to Quote instead.`,
      );
    }

    priced.push({
      variantId: line.id,
      name: context.product.name,
      sku: context.variant.sku,
      spec: context.specLine,
      quantity: line.quantity,
      unitPrice: resolved.unitPricePesewas,
      lineTotal: resolved.unitPricePesewas * line.quantity,
    });
  }

  const goodsTotal = priced.reduce((sum, line) => sum + line.lineTotal, 0);
  const delivery = resolveDeliveryFee(
    {
      feeMode: zone.feeMode,
      basePrice: zone.basePrice,
      freeShippingThreshold: zone.freeShippingThreshold,
    },
    goodsTotal,
  );
  const taxable = goodsTotal + delivery.feePesewas;
  const settings = await getStoreSettings();
  const tax = inclusiveVatBreakdown(taxable, settings.vatRateBps);
  const grandTotal = goodsTotal + delivery.feePesewas;
  const status =
    delivery.status === "pending_nationwide"
      ? ("awaiting_terms" as const)
      : ("pending_payment" as const);
  const number = await nextDocumentNumber("order");

  const order = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(orders)
      .values({
        number,
        source: "cart",
        sessionId: input.sessionId,
        profileId: input.profileId ?? null,
        status,
        goodsTotal,
        taxTotal: tax.taxTotal,
        taxJson: tax.taxJson,
        deliveryFee: delivery.feePesewas,
        deliveryFeeStatus: delivery.status,
        grandTotal,
        addressSnapshot: input.address,
        deliveryZoneId: zone.id,
      })
      .returning();

    if (!created) {
      throw new CheckoutError("Could not create the order.");
    }

    await tx.insert(orderItems).values(
      priced.map((line) => ({
        orderId: created.id,
        variantId: line.variantId,
        nameSnapshot: line.name,
        skuSnapshot: line.sku,
        specSnapshot: line.spec,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.lineTotal,
        taxTotal: inclusiveVatBreakdown(line.lineTotal, settings.vatRateBps).taxTotal,
      })),
    );

    return created;
  });

  await notifyOrderPlaced({
    orderId: order.id,
    orderNumber: order.number,
    source: "cart",
    email: input.address.email,
    contactName: input.address.fullName,
    grandTotalPesewas: order.grandTotal,
    nationwide: delivery.status === "pending_nationwide",
  });

  return {
    number: order.number,
    status: order.status,
    grandTotal: order.grandTotal,
    deliveryFeeStatus: order.deliveryFeeStatus,
  };
}
