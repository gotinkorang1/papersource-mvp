import { AccountLink } from "@/components/navigation/account-link";
import { DualPathCounts } from "@/components/navigation/dual-path-counts";
import { ShopMegaMenu } from "@/components/navigation/shop-mega-menu";
import { BusinessMenu } from "@/components/navigation/business-menu";
import { Wordmark } from "@/components/marketing/wordmark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SiteLinks } from "@/components/navigation/site-links";
import { FALLBACK_NAVIGATION, listActiveNavigation } from "@/features/content";

export async function StoreHeader() {
  const managedLinks = await listActiveNavigation("header");
  const links = managedLinks.length ? managedLinks : FALLBACK_NAVIGATION.header;
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
          {managedLinks.length ? links.map((link) => <a key={link.href} href={link.href} className="border-b-2 border-transparent text-sm font-medium text-graphite transition hover:border-ochre hover:text-ink">{link.label}</a>) : <SiteLinks />}
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
