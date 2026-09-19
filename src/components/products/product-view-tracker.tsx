"use client";

import { useEffect } from "react";
import { ensureViewFingerprint } from "@/features/catalogue/view-tracking";

export function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    let fingerprint: string;
    try {
      fingerprint = ensureViewFingerprint(window.localStorage);
    } catch {
      return;
    }

    void fetch("/api/catalogue/product-view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, fingerprint }),
      keepalive: true,
    }).catch(() => undefined);
  }, [productId]);

  return null;
}
