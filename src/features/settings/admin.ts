import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { storeSettings } from "@/lib/db/schema";
import { canAccessAdmin } from "@/lib/staff/rbac";
import type { StaffRole } from "@/lib/staff/types";

export const DEFAULT_STORE_SETTINGS = {
  id: "store",
  vatRateBps: 1500,
  quoteExpiryDays: 14,
  whatsappBusinessNumber: null as string | null,
  siteUrl: "http://localhost:3000",
  paymentsEnabled: true,
  paymentMode: "test" as const,
  updatedAt: null as Date | null,
};

export class SettingsAdminError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SettingsAdminError";
  }
}

export type StoreSettingsForm = {
  vatRateBps: string;
  quoteExpiryDays: string;
  whatsappBusinessNumber: string;
  siteUrl: string;
  paymentsEnabled?: string;
  paymentMode?: string;
};

export function parseStoreSettings(input: StoreSettingsForm) {
  const wholeNumber = (value: string, label: string, minimum: number, maximum: number) => {
    if (!/^\d+$/.test(value.trim())) {
      throw new SettingsAdminError(`${label} must be a whole number.`);
    }
    const parsed = Number(value);
    if (parsed < minimum || parsed > maximum) {
      throw new SettingsAdminError(`${label} must be between ${minimum} and ${maximum}.`);
    }
    return parsed;
  };

  const whatsapp = input.whatsappBusinessNumber.trim();
  if (whatsapp && !/^\+[1-9]\d{7,14}$/.test(whatsapp)) {
    throw new SettingsAdminError("WhatsApp must use an international number such as +233201234567.");
  }

  const parsedUrl = z.url().safeParse(input.siteUrl.trim());
  if (!parsedUrl.success || !/^https?:$/.test(new URL(parsedUrl.data).protocol)) {
    throw new SettingsAdminError("Site URL must be an http or https URL.");
  }
  const siteUrl = parsedUrl.data.replace(/\/$/, "");
  const paymentMode: "test" | "live" = input.paymentMode === "live" ? "live" : "test";
  if (paymentMode === "live" && !process.env.PAYSTACK_SECRET_KEY?.trim().startsWith("sk_live_")) {
    throw new SettingsAdminError("Live mode requires a configured server-side live Paystack key.");
  }
  if (!paymentMode) throw new SettingsAdminError("Payment mode must be test or live.");

  return {
    vatRateBps: wholeNumber(input.vatRateBps, "VAT basis points", 0, 10_000),
    quoteExpiryDays: wholeNumber(input.quoteExpiryDays, "Quote expiry days", 1, 90),
    whatsappBusinessNumber: whatsapp || null,
    siteUrl,
    paymentsEnabled: input.paymentsEnabled === "true",
    paymentMode,
  };
}

export async function getStoreSettings() {
  if (!isDatabaseConfigured()) return DEFAULT_STORE_SETTINGS;
  try {
    const [row] = await getDb().select().from(storeSettings).where(eq(storeSettings.id, "store")).limit(1);
    return row ?? DEFAULT_STORE_SETTINGS;
  } catch (error) {
    // Keep older local/preview databases usable until the settings migration is applied.
    const code = (error as { code?: string; cause?: { code?: string } })?.code
      ?? (error as { cause?: { code?: string } })?.cause?.code;
    if (code === "42P01") return DEFAULT_STORE_SETTINGS;
    throw error;
  }
}

export async function saveStoreSettings(input: StoreSettingsForm & { role: StaffRole; actorId: string }) {
  if (!canAccessAdmin(input.role, "settings", "write")) {
    throw new SettingsAdminError("This role cannot change store settings.");
  }
  const values = parseStoreSettings(input);
  const [saved] = await getDb()
    .insert(storeSettings)
    .values({ id: "store", ...values, updatedBy: input.actorId, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: storeSettings.id,
      set: { ...values, updatedBy: input.actorId, updatedAt: new Date() },
    })
    .returning();
  if (!saved) throw new SettingsAdminError("Could not save store settings.");
  return saved;
}
