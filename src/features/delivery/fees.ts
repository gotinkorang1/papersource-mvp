import type { DeliveryFeeMode } from "@/types/commerce";

export type DeliveryFeeResult = {
  feePesewas: number;
  status: "calculated" | "pending_nationwide";
};

export function resolveDeliveryFee(
  zone: {
    feeMode: DeliveryFeeMode;
    basePrice: number;
    freeShippingThreshold: number | null;
  },
  goodsPesewas: number,
): DeliveryFeeResult {
  if (!Number.isInteger(goodsPesewas) || !Number.isInteger(zone.basePrice)) {
    throw new Error("Delivery money must be integer pesewas");
  }

  if (zone.feeMode === "on_request") {
    return { feePesewas: 0, status: "pending_nationwide" };
  }

  if (
    zone.freeShippingThreshold != null &&
    goodsPesewas >= zone.freeShippingThreshold
  ) {
    return { feePesewas: 0, status: "calculated" };
  }

  return { feePesewas: zone.basePrice, status: "calculated" };
}

export function zoneCodeForDeliveryArea(
  area: "accra" | "tema" | "other",
): string {
  if (area === "accra") {
    return "accra_central";
  }
  if (area === "tema") {
    return "tema";
  }
  return "nationwide_request";
}
