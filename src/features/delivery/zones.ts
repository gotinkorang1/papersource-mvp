import type { DeliveryBadgeModel } from "@/types/catalogue";
import type { DeliveryFeeMode } from "@/types/commerce";

export type DeliveryZoneInput = {
  code?: string;
  name: string;
  region: string;
  feeMode: DeliveryFeeMode;
  active?: boolean;
};

export function storefrontDeliveryBadge(
  zones: DeliveryZoneInput[],
): DeliveryBadgeModel {
  const active = zones.filter((zone) => zone.active !== false);
  const pickupAvailable = active.some(
    (zone) => zone.code === "shop_pickup" || /shop\s*pickup|pickup/i.test(zone.name),
  );
  const hasAccra = active.some(
    (zone) => zone.feeMode === "calculated" && /accra/i.test(zone.name),
  );
  const hasTema = active.some(
    (zone) => zone.feeMode === "calculated" && /tema/i.test(zone.name),
  );

  if (hasAccra && hasTema) {
    return {
      label: "Accra & Tema delivery available",
      feeMode: "calculated",
      pickupAvailable,
    };
  }

  if (active.some((zone) => zone.feeMode === "on_request")) {
    return {
      label: "Nationwide delivery can be arranged on request",
      feeMode: "on_request",
      pickupAvailable,
    };
  }

  return {
    label: "Delivery options vary by location",
    feeMode: "calculated",
    pickupAvailable,
  };
}
