"use client";

import { ClipboardList, ShoppingBag } from "lucide-react";
import { useDualPathPreview } from "@/features/preview/dual-path-preview";
import { itemCountLabel } from "@/lib/copy";

export function DualPathCounts() {
  const { cartLines, quoteLines, cartOpen, quoteOpen, setCartOpen, setQuoteOpen } =
    useDualPathPreview();
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const quoteCount = quoteLines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="flex items-center gap-3 text-sm">
      <button
        type="button"
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-md px-1 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${quoteOpen ? "text-ink" : "text-graphite"}`}
        aria-label={itemCountLabel("Quote list", quoteCount)}
        aria-expanded={quoteOpen}
        aria-pressed={quoteOpen}
        aria-haspopup="dialog"
        aria-controls="paper-drawer-quote-list"
        onClick={() => setQuoteOpen(true)}
      >
        <ClipboardList className="size-4" aria-hidden />
        <span className="hidden sm:inline">Quote List</span>
        <span className="font-medium text-ink">{quoteCount}</span>
      </button>
      <button
        type="button"
        className={`inline-flex min-h-11 items-center gap-1.5 rounded-md px-1 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${cartOpen ? "text-ink" : "text-graphite"}`}
        aria-label={itemCountLabel("Cart", cartCount)}
        aria-expanded={cartOpen}
        aria-pressed={cartOpen}
        aria-haspopup="dialog"
        aria-controls="paper-drawer-cart"
        onClick={() => setCartOpen(true)}
      >
        <ShoppingBag className="size-4" aria-hidden />
        <span className="hidden sm:inline">Cart</span>
        <span className="font-medium text-ink">{cartCount}</span>
      </button>
    </div>
  );
}
