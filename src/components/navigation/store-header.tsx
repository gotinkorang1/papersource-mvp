import { AccountLink } from "@/components/navigation/account-link";
import { DualPathCounts } from "@/components/navigation/dual-path-counts";
import { ShopMegaMenu } from "@/components/navigation/shop-mega-menu";
import { BusinessMenu } from "@/components/navigation/business-menu";
import { Wordmark } from "@/components/marketing/wordmark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SiteLinks } from "@/components/navigation/site-links";

export function StoreHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-card/90 shadow-[0_4px_18px_rgba(16,42,67,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3.5 sm:gap-5 sm:px-6 lg:px-8">
        <Wordmark />
        <nav
          className="hidden items-center gap-3 text-sm text-graphite md:flex lg:gap-4"
          aria-label="Primary"
        >
          <ShopMegaMenu />
          <BusinessMenu />
          <SiteLinks />
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
          <AccountLink />
          <ThemeToggle />
          <DualPathCounts />
        </div>
      </div>
    </header>
  );
}
