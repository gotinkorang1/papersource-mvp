import type { ReactNode } from "react";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { QuoteBasket } from "@/components/quotes/quote-basket";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { StoreFooter } from "@/components/navigation/store-footer";
import { StoreHeader } from "@/components/navigation/store-header";
import { DualPathPreviewProvider } from "@/features/preview/dual-path-preview";

export function StoreShell({ children }: { children: ReactNode }) {
  return (
    <DualPathPreviewProvider>
      <StoreHeader />
      <div className="flex flex-1 flex-col pb-16 md:pb-0">{children}</div>
      <StoreFooter />
      <MobileNav />
      <CartDrawer />
      <QuoteBasket />
    </DualPathPreviewProvider>
  );
}
