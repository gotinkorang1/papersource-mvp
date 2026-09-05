"use client";

import Link from "next/link";
import { ClipboardList, House, Search, ShoppingBag, Store } from "lucide-react";
import { useDualPathPreview } from "@/features/preview/dual-path-preview";
import { itemCountLabel } from "@/lib/copy";

export function MobileNav() {
  const { cartLines, quoteLines, setCartOpen, setQuoteOpen } =
    useDualPathPreview();
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const quoteCount = quoteLines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_30px_rgba(16,42,67,0.1)] backdrop-blur-xl md:hidden"
    >
      <ul className="grid grid-cols-5">
        <li>
          <Link
            href="/"
            className="flex min-h-14 flex-col items-center justify-center gap-1 px-2 py-2 text-xs text-slate transition-colors hover:text-ink focus-visible:z-10"
          >
            <House className="size-4" aria-hidden />
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/shop"
            className="flex min-h-14 flex-col items-center justify-center gap-1 px-2 py-2 text-xs text-slate transition-colors hover:text-ink focus-visible:z-10"
          >
            <Store className="size-4" aria-hidden />
            Shop
          </Link>
        </li>
        <li>
          <Link
            href="/search"
            className="flex min-h-14 flex-col items-center justify-center gap-1 px-2 py-2 text-xs text-slate transition-colors hover:text-ink focus-visible:z-10"
          >
            <Search className="size-4" aria-hidden />
            Search
          </Link>
        </li>
        <li>
          <button
            type="button"
            className="flex min-h-14 w-full flex-col items-center justify-center gap-1 px-2 py-2 text-xs text-slate transition-colors hover:text-ink focus-visible:z-10"
            aria-label={itemCountLabel("Quote list", quoteCount)}
            onClick={() => setQuoteOpen(true)}
          >
            <ClipboardList className="size-4" aria-hidden />
            Quote
          </button>
        </li>
        <li>
          <button
            type="button"
            className="flex min-h-14 w-full flex-col items-center justify-center gap-1 px-2 py-2 text-xs text-slate transition-colors hover:text-ink focus-visible:z-10"
            aria-label={itemCountLabel("Cart", cartCount)}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="size-4" aria-hidden />
            Cart
          </button>
        </li>
      </ul>
    </nav>
  );
}
