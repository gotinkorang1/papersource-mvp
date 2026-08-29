"use client";

import Link from "next/link";
import { ClipboardList, House, Search, ShoppingBag, Store } from "lucide-react";
import { useDualPathPreview } from "@/features/preview/dual-path-preview";

export function MobileNav() {
  const { cartLines, quoteLines, setCartOpen, setQuoteOpen } =
    useDualPathPreview();
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const quoteCount = quoteLines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden"
    >
      <ul className="grid grid-cols-5">
        <li>
          <Link
            href="/"
            className="flex flex-col items-center gap-1 px-2 py-3 text-xs text-slate"
          >
            <House className="size-4" aria-hidden />
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/shop"
            className="flex flex-col items-center gap-1 px-2 py-3 text-xs text-slate"
          >
            <Store className="size-4" aria-hidden />
            Shop
          </Link>
        </li>
        <li>
          <Link
            href="/search"
            className="flex flex-col items-center gap-1 px-2 py-3 text-xs text-slate"
          >
            <Search className="size-4" aria-hidden />
            Search
          </Link>
        </li>
        <li>
          <button
            type="button"
            className="flex w-full flex-col items-center gap-1 px-2 py-3 text-xs text-slate"
            aria-label={`Quote list, ${quoteCount} items`}
            onClick={() => setQuoteOpen(true)}
          >
            <ClipboardList className="size-4" aria-hidden />
            Quote
          </button>
        </li>
        <li>
          <button
            type="button"
            className="flex w-full flex-col items-center gap-1 px-2 py-3 text-xs text-slate"
            aria-label={`Cart, ${cartCount} items`}
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
