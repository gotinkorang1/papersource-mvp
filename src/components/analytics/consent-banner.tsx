"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ANALYTICS_CONSENT_KEY } from "@/lib/analytics";

export const CONSENT_EVENT = "papersource-analytics-consent-change";

export function dispatchAnalyticsConsent(value: "granted" | "denied") {
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
  } catch {
    // Storage can be blocked; in that case the choice is intentionally not persisted.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

export function ConsentBanner() {
  // Keep the first render identical on the server and browser. Reading
  // localStorage during the state initializer causes a hydration mismatch for
  // returning visitors who already chose a preference.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setVisible(!window.localStorage.getItem(ANALYTICS_CONSENT_KEY));
      } catch {
        setVisible(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <aside aria-label="Analytics cookie preferences" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl border border-border bg-card p-4 shadow-[0_18px_60px_rgba(16,42,67,0.2)] sm:inset-x-auto sm:right-6 sm:bottom-6">
      <p className="text-sm font-semibold text-ink">Help us improve PaperSource</p>
      <p className="mt-1 text-sm leading-6 text-slate">Allow anonymous analytics so we can understand which products and checkout steps need improvement. We do not send your name, email, address, or payment details.</p>
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        <Link href="/privacy" className="mr-auto text-xs font-semibold text-slate underline underline-offset-4">Privacy details</Link>
        <button type="button" onClick={() => { dispatchAnalyticsConsent("denied"); setVisible(false); }} className="min-h-10 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-ink hover:bg-muted">Decline</button>
        <button type="button" onClick={() => { dispatchAnalyticsConsent("granted"); setVisible(false); }} className="min-h-10 rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-ink/90">Allow analytics</button>
      </div>
    </aside>
  );
}
