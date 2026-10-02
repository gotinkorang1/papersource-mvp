"use client";

import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";
import { hasAnalyticsConsent } from "@/lib/analytics";
import { CONSENT_EVENT } from "@/components/analytics/consent-banner";

/** Keeps Vercel Analytics aligned with the site's shared analytics choice. */
export function ConsentAwareVercelAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setEnabled(hasAnalyticsConsent()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onConsentChange = (event: Event) => {
      setEnabled((event as CustomEvent<string>).detail === "granted");
    };
    window.addEventListener(CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(CONSENT_EVENT, onConsentChange);
  }, []);

  return enabled ? <Analytics /> : null;
}
