"use client";

import { paperButton } from "@/components/commerce/paper-button";

export function PrintReceiptButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`${paperButton({ variant: "secondary" })} print:hidden`}
    >
      Print receipt / Save PDF
    </button>
  );
}
