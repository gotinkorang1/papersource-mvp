import { describe, expect, it } from "vitest";
import { parseStoreSettings } from "./admin";
import { canAccessAdmin } from "@/lib/staff/rbac";

describe("parseStoreSettings", () => {
  it("accepts integer basis points, expiry days, E.164 WhatsApp and HTTPS site URL", () => {
    expect(parseStoreSettings({
      vatRateBps: "1500",
      quoteExpiryDays: "14",
      whatsappBusinessNumber: "+233201234567",
      siteUrl: "https://papersourcegh.com/",
    })).toEqual({
      vatRateBps: 1500,
      quoteExpiryDays: 14,
      whatsappBusinessNumber: "+233201234567",
      siteUrl: "https://papersourcegh.com",
      paymentsEnabled: false,
      paymentMode: "test",
    });
  });

  it("rejects fractional rates, unsafe URLs and non-E.164 numbers", () => {
    expect(() => parseStoreSettings({ vatRateBps: "1500.5", quoteExpiryDays: "14", whatsappBusinessNumber: "+233201234567", siteUrl: "https://papersourcegh.com" })).toThrow(/whole number/);
    expect(() => parseStoreSettings({ vatRateBps: "1500", quoteExpiryDays: "14", whatsappBusinessNumber: "0201234567", siteUrl: "https://papersourcegh.com" })).toThrow(/international/);
    expect(() => parseStoreSettings({ vatRateBps: "1500", quoteExpiryDays: "14", whatsappBusinessNumber: "+233201234567", siteUrl: "javascript:alert(1)" })).toThrow(/http/);
  });

  it("keeps settings writes restricted to ADMIN and SUPER_ADMIN", () => {
    expect(canAccessAdmin("admin", "settings", "write")).toBe(true);
    expect(canAccessAdmin("super_admin", "settings", "write")).toBe(true);
    expect(canAccessAdmin("sales", "settings", "write")).toBe(false);
    expect(canAccessAdmin("warehouse", "settings", "write")).toBe(false);
  });
});
