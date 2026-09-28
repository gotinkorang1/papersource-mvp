"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { hasAnalyticsConsent } from "@/lib/analytics";
import { CONSENT_EVENT } from "@/components/analytics/consent-banner";

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Loads GA4 only when a measurement ID is configured for the current
 * deployment. Keeping the ID in an environment variable lets local builds
 * remain analytics-free and makes staging/production configuration explicit.
 */
export function GoogleAnalytics() {
  // Resolve consent after hydration so a stored browser preference cannot
  // change the initial server-rendered tree.
  const [enabled, setEnabled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const timer = window.setTimeout(() => setEnabled(hasAnalyticsConsent()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onConsentChange = () => setEnabled(hasAnalyticsConsent());
    window.addEventListener(CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(CONSENT_EVENT, onConsentChange);
  }, []);

  useEffect(() => {
    if (!enabled || typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pathname,
    });
  }, [enabled, pathname]);

  if (!measurementId) return null;

  return (
    <>
      <script
        id="google-analytics-consent-default"
        dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});` }}
      />
      {enabled ? <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
gtag('js', new Date());
gtag('consent', 'update', { analytics_storage: 'granted' });
gtag('config', '${measurementId}', { send_page_view: false, anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });`}
        </Script>
      </> : null}
    </>
  );
}
