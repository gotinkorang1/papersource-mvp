"use client";

import { useEffect } from "react";
import { pesewasToGhs, trackEcommerceEvent } from "@/lib/analytics";

export function PurchaseAnalytics({
  transactionId,
  valuePesewas,
  taxPesewas,
  shippingPesewas,
  items,
}: {
  transactionId: string;
  valuePesewas: number;
  taxPesewas: number;
  shippingPesewas: number;
  items: Array<{ id: string; name: string; quantity: number; unitPricePesewas: number }>;
}) {
  useEffect(() => {
    const key = `papersource-purchase-tracked:${transactionId}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // A blocked session store still allows the event to be sent once per render.
    }
    trackEcommerceEvent("purchase", {
      transaction_id: transactionId,
      value: pesewasToGhs(valuePesewas),
      tax: pesewasToGhs(taxPesewas),
      shipping: pesewasToGhs(shippingPesewas),
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: pesewasToGhs(item.unitPricePesewas),
        quantity: item.quantity,
      })),
    });
  }, [items, shippingPesewas, taxPesewas, transactionId, valuePesewas]);

  return null;
}

