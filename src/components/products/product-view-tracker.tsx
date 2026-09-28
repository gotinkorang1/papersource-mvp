"use client";

import { useEffect } from "react";
import { ensureViewFingerprint } from "@/features/catalogue/view-tracking";
import { pesewasToGhs, trackEcommerceEvent } from "@/lib/analytics";

export function ProductViewTracker({ productId, sku, productName, pricePesewas, enabled = true }: { productId: string; sku?: string; productName?: string; pricePesewas?: number; enabled?: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    if (sku && productName && typeof pricePesewas === "number") {
      trackEcommerceEvent("view_item", {
        value: pesewasToGhs(pricePesewas),
        items: [{ item_id: sku, item_name: productName, price: pesewasToGhs(pricePesewas), quantity: 1 }],
      });
    }
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
  }, [enabled, productId, pricePesewas, productName, sku]);

  return null;
}
