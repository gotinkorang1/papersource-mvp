import { eq } from "drizzle-orm";
import { storefrontDeliveryBadge } from "@/features/delivery/zones";
import { seedDeliveryZones } from "@/features/catalogue/local-data";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { deliveryZones } from "@/lib/db/schema";
import type { DeliveryBadgeModel } from "@/types/catalogue";

export async function listActiveDeliveryZones() {
  if (!isDatabaseConfigured()) {
    return seedDeliveryZones.map((zone) => ({
      name: zone.name,
      region: zone.region,
      feeMode: zone.feeMode,
      active: true,
    }));
  }

  const db = getDb();
  return db
    .select({
      name: deliveryZones.name,
      region: deliveryZones.region,
      feeMode: deliveryZones.feeMode,
      active: deliveryZones.active,
    })
    .from(deliveryZones)
    .where(eq(deliveryZones.active, true));
}

export async function getStorefrontDeliveryBadge(): Promise<DeliveryBadgeModel> {
  const zones = await listActiveDeliveryZones();
  return storefrontDeliveryBadge(zones);
}
