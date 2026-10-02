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

    const eventKey = `papersource.product-view.${productId}.${new Date().toISOString().slice(0, 10)}`;
    let sessionStorageAvailable = false;
    try {
      if (window.sessionStorage.getItem(eventKey)) return;
      // Claim the daily slot before the request starts so rapid navigation does
      // not send duplicate view events while the first request is in flight.
      window.sessionStorage.setItem(eventKey, "pending");
      sessionStorageAvailable = true;
    } catch {
      // Continue without the client-side duplicate guard when storage is blocked.
    }

    void fetch("/api/catalogue/view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, fingerprint }),
      keepalive: true,
    }).then(() => {
      if (!sessionStorageAvailable) return;
      try { window.sessionStorage.setItem(eventKey, "1"); } catch { /* best effort */ }
    }).catch(() => {
      if (!sessionStorageAvailable) return;
      try { window.sessionStorage.removeItem(eventKey); } catch { /* best effort */ }
    });
  }, [enabled, productId, pricePesewas, productName, sku]);

  return null;
}
