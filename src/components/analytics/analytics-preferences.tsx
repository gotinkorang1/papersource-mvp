"use client";

import { clearAnalyticsConsent } from "@/components/analytics/consent-banner";

export function AnalyticsPreferences() {
  return <button type="button" onClick={clearAnalyticsConsent} className="text-left text-ink underline underline-offset-4 hover:no-underline">Change analytics preferences</button>;
}
