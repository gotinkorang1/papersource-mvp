import type { ReactNode } from "react";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { QuoteBasket } from "@/components/quotes/quote-basket";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { StoreFooter } from "@/components/navigation/store-footer";
import { StoreHeader } from "@/components/navigation/store-header";
import { loadGuestDualPath } from "@/features/preview/actions";
import { DualPathPreviewProvider } from "@/features/preview/dual-path-preview";
import { isDatabaseConfigured } from "@/lib/db/client";
import { AnnouncementBanner } from "@/components/navigation/announcement-banner";

export async function StoreShell({ children }: { children: ReactNode }) {
  const persist = isDatabaseConfigured();
  const initial = persist
    ? await loadGuestDualPath()
    : { cartLines: [], quoteLines: [] };
  const hydrationKey = [
    ...initial.cartLines.map((line) => `c:${line.id}:${line.quantity}`),
    ...initial.quoteLines.map((line) => `q:${line.id}:${line.quantity}`),
  ].join("|");

  return (
    <DualPathPreviewProvider
      key={hydrationKey || "empty"}
      persist={persist}
      initialCartLines={initial.cartLines}
      initialQuoteLines={initial.quoteLines}
    >
      <AnnouncementBanner />
      <StoreHeader />
      <div className="flex flex-1 flex-col pb-16 md:pb-0">{children}</div>
      <StoreFooter />
      <MobileNav />
      <CartDrawer />
      <QuoteBasket />
    </DualPathPreviewProvider>
  );
}
