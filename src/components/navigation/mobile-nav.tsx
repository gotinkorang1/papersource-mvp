"use client";

import Link from "next/link";
import { ClipboardList, House, Search, ShoppingBag, Store } from "lucide-react";
import { useDualPathPreview } from "@/features/preview/dual-path-preview";
import { itemCountLabel } from "@/lib/copy";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const { cartLines, quoteLines, cartOpen, quoteOpen, setCartOpen, setQuoteOpen } =
    useDualPathPreview();
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const shopActive = isActive("/shop") || isActive("/product") || ["/brands", "/bulk-orders", "/quick-order"].includes(pathname);
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0);
  const quoteCount = quoteLines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_30px_rgba(16,42,67,0.1)] backdrop-blur-xl [transform:translateZ(0)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        <li>
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={`group flex min-h-14 flex-col items-center justify-center gap-1 rounded-md border-t-2 px-2 py-2 text-xs transition-[color,background-color,border-color] hover:bg-cream/60 hover:text-ink focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ink ${pathname === "/" ? "border-ochre bg-cream/40 text-ink" : "border-transparent text-slate"}`}
          >
            <House className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5" aria-hidden />
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/shop"
            aria-current={shopActive ? "page" : undefined}
            className={`group flex min-h-14 flex-col items-center justify-center gap-1 rounded-md border-t-2 px-2 py-2 text-xs transition-[color,background-color,border-color] hover:bg-cream/60 hover:text-ink focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ink ${shopActive ? "border-ochre bg-cream/40 text-ink" : "border-transparent text-slate"}`}
          >
            <Store className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5" aria-hidden />
            Shop
          </Link>
        </li>
        <li>
          <Link
            href="/search"
            aria-current={isActive("/search") ? "page" : undefined}
            className={`group flex min-h-14 flex-col items-center justify-center gap-1 rounded-md border-t-2 px-2 py-2 text-xs transition-[color,background-color,border-color] hover:bg-cream/60 hover:text-ink focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ink ${isActive("/search") ? "border-ochre bg-cream/40 text-ink" : "border-transparent text-slate"}`}
          >
            <Search className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5" aria-hidden />
            Search
          </Link>
        </li>
        <li>
          <button
            type="button"
            className={`group flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-md border-t-2 px-2 py-2 text-xs transition-[color,background-color,border-color] hover:bg-cream/60 hover:text-ink focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ink ${quoteOpen ? "border-ochre bg-cream/40 text-ink" : "border-transparent text-slate"}`}
            aria-label={itemCountLabel("Quote list", quoteCount)}
            aria-expanded={quoteOpen}
            aria-pressed={quoteOpen}
            onClick={() => setQuoteOpen(!quoteOpen)}
          >
            <span className="relative"><ClipboardList className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5" aria-hidden />{quoteCount > 0 ? <span className="absolute -right-3 -top-2 min-w-4 rounded-full bg-ochre px-1 text-center text-[10px] font-bold leading-4 text-ink">{quoteCount > 99 ? "99+" : quoteCount}</span> : null}</span>
            Quote
          </button>
        </li>
        <li>
          <button
            type="button"
            className={`group flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-md border-t-2 px-2 py-2 text-xs transition-[color,background-color,border-color] hover:bg-cream/60 hover:text-ink focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-ink ${cartOpen ? "border-ochre bg-cream/40 text-ink" : "border-transparent text-slate"}`}
            aria-label={itemCountLabel("Cart", cartCount)}
            aria-expanded={cartOpen}
            aria-pressed={cartOpen}
            onClick={() => setCartOpen(!cartOpen)}
          >
            <span className="relative"><ShoppingBag className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5" aria-hidden />{cartCount > 0 ? <span className="absolute -right-3 -top-2 min-w-4 rounded-full bg-ochre px-1 text-center text-[10px] font-bold leading-4 text-ink">{cartCount > 99 ? "99+" : cartCount}</span> : null}</span>
            Cart
          </button>
        </li>
      </ul>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {cartCount > 0 ? `${cartCount} ${cartCount === 1 ? "item" : "items"} in cart.` : "Cart is empty."}{" "}
        {quoteCount > 0 ? `${quoteCount} ${quoteCount === 1 ? "item" : "items"} in quote list.` : "Quote list is empty."}
      </p>
    </nav>
  );
}
