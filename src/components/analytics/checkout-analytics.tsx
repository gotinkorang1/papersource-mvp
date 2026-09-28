"use client";

import { useEffect, useRef } from "react";
import { pesewasToGhs, trackEcommerceEvent } from "@/lib/analytics";

export function CheckoutAnalytics({ lines }: { lines: Array<{ id: string; name: string; quantity: number; unitPricePesewas: number }> }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || lines.length === 0) return;
    sent.current = true;
    trackEcommerceEvent("begin_checkout", {
      value: pesewasToGhs(lines.reduce((sum, line) => sum + line.unitPricePesewas * line.quantity, 0)),
      items: lines.map((line) => ({
        item_id: line.id,
        item_name: line.name,
        price: pesewasToGhs(line.unitPricePesewas),
        quantity: line.quantity,
      })),
    });
  }, [lines]);

  return null;
}

