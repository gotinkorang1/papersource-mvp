"use client";

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  price: number;
  quantity: number;
};

type Gtag = (command: "config" | "event" | "consent", target: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

export const ANALYTICS_CONSENT_KEY = "papersource-analytics-consent";
const CONSENT_EVENT = "papersource-analytics-consent-change";
const pendingEvents: Array<{ name: string; params: Record<string, unknown> }> = [];
let consentListenerAttached = false;

export function hasAnalyticsConsent() {
  try {
    return window.localStorage.getItem(ANALYTICS_CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (hasAnalyticsConsent() && typeof window.gtag === "function") {
    window.gtag("event", name, params);
    return;
  }

  // Keep events generated before the shopper makes a choice only in memory.
  // They are discarded on a hard refresh and never persisted without consent.
  let choice: string | null = null;
  try {
    choice = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
  } catch {
    return;
  }
  if (choice !== null || typeof window === "undefined") return;
  pendingEvents.push({ name, params });
  if (consentListenerAttached) return;
  consentListenerAttached = true;
  window.addEventListener(CONSENT_EVENT, () => {
    if (!hasAnalyticsConsent() || typeof window.gtag !== "function") {
      pendingEvents.length = 0;
      return;
    }
    for (const pending of pendingEvents.splice(0)) window.gtag("event", pending.name, pending.params);
  }, { once: true });
}

export function trackEcommerceEvent(
  name: "view_item" | "add_to_cart" | "remove_from_cart" | "view_item_list" | "begin_checkout" | "purchase" | "refund",
  params: { items: AnalyticsItem[]; value?: number; currency?: "GHS"; transaction_id?: string; tax?: number; shipping?: number },
) {
  trackEvent(name, { currency: "GHS", ...params });
}

export function pesewasToGhs(pesewas: number) {
  return Math.round((pesewas / 100) * 100) / 100;
}
