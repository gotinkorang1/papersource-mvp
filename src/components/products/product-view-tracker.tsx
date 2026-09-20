"use client";

import { useEffect } from "react";
import { ensureViewFingerprint } from "@/features/catalogue/view-tracking";

export function ProductViewTracker({ productId, enabled = true }: { productId: string; enabled?: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    let fingerprint: string;
    try {
      // Some privacy modes expose localStorage but throw on access.
      const storage = window.localStorage;
      fingerprint = ensureViewFingerprint(storage);
    } catch {
      return;
    }

    void fetch("/api/catalogue/view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, fingerprint }),
      keepalive: true,
    }).catch(() => undefined);
  }, [enabled, productId]);

  return null;
}
