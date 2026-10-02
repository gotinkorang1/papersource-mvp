"use client";

import { useEffect, useState } from "react";
import { publicEnv } from "@/lib/env";
import { hasAnalyticsConsent } from "@/lib/analytics";
import { CONSENT_EVENT } from "@/components/analytics/consent-banner";

const projectId = publicEnv.NEXT_PUBLIC_CLARITY_PROJECT_ID;

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

/**
 * Loads Microsoft Clarity only after the shared analytics consent choice.
 * The project ID is public, but keeping it configurable prevents local and
 * preview sessions from being mixed into the production heatmap by accident.
 */
export function MicrosoftClarity() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setEnabled(hasAnalyticsConsent()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onConsentChange = (event: Event) => {
      const granted = (event as CustomEvent<string>).detail === "granted";
      setEnabled(granted);
      if (typeof window.clarity === "function") {
        window.clarity("consentv2", {
          ad_Storage: "denied",
          analytics_Storage: granted ? "granted" : "denied",
        });
      }
    };
    window.addEventListener(CONSENT_EVENT, onConsentChange);
    return () => window.removeEventListener(CONSENT_EVENT, onConsentChange);
  }, []);

  if (!projectId || !enabled) return null;

  return (
    <script
      id="microsoft-clarity"
      dangerouslySetInnerHTML={{
        __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script",${JSON.stringify(projectId)});window.clarity("consentv2",{ad_Storage:"denied",analytics_Storage:"granted"});`,
      }}
    />
  );
}
