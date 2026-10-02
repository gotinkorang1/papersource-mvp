import { and, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { storefrontDeliveryBadge } from "@/features/delivery/zones";
import { seedDeliveryZones } from "@/features/catalogue/local-data";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { deliveryZones } from "@/lib/db/schema";
import type { DeliveryBadgeModel } from "@/types/catalogue";

const loadActiveDeliveryZones = unstable_cache(async function loadActiveDeliveryZones() {
  const db = getDb();
  return db
    .select({
      id: deliveryZones.id,
      code: deliveryZones.code,
      name: deliveryZones.name,
      region: deliveryZones.region,
      feeMode: deliveryZones.feeMode,
      basePrice: deliveryZones.basePrice,
      freeShippingThreshold: deliveryZones.freeShippingThreshold,
      active: deliveryZones.active,
    })
    .from(deliveryZones)
    .where(eq(deliveryZones.active, true));
}, ["delivery-active-zones"], { revalidate: 300, tags: ["delivery"] });

export async function listActiveDeliveryZones() {
  if (!isDatabaseConfigured()) {
    return seedDeliveryZones.map((zone) => ({
      name: zone.name,
      region: zone.region,
      feeMode: zone.feeMode,
      active: true,
    }));
  }
  return loadActiveDeliveryZones();
}

const loadDeliveryZoneByCode = unstable_cache(async function loadDeliveryZoneByCode(code: string) {
  const db = getDb();
  const [zone] = await db
    .select({ id: deliveryZones.id, code: deliveryZones.code, name: deliveryZones.name, region: deliveryZones.region, feeMode: deliveryZones.feeMode, basePrice: deliveryZones.basePrice, freeShippingThreshold: deliveryZones.freeShippingThreshold, active: deliveryZones.active })
    .from(deliveryZones)
    .where(and(eq(deliveryZones.code, code), eq(deliveryZones.active, true)))
    .limit(1);
  return zone ?? null;
}, ["delivery-zone-by-code"], { revalidate: 300, tags: ["delivery"] });

export async function getDeliveryZoneByCode(code: string) {
  if (!isDatabaseConfigured()) {
    const zone = seedDeliveryZones.find((entry) => entry.code === code);
    if (!zone) {
      return null;
    }
    return {
      id: zone.code,
      code: zone.code,
      name: zone.name,
      region: zone.region,
      feeMode: zone.feeMode,
      basePrice: zone.basePrice,
      freeShippingThreshold: null as number | null,
      active: true,
    };
  }
  return loadDeliveryZoneByCode(code);
}

export async function getStorefrontDeliveryBadge(): Promise<DeliveryBadgeModel> {
  const zones = await listActiveDeliveryZones();
  return storefrontDeliveryBadge(zones);
}
