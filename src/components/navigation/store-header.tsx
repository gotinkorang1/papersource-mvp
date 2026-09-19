import { AccountLink } from "@/components/navigation/account-link";
import Link from "next/link";
import { DualPathCounts } from "@/components/navigation/dual-path-counts";
import { ShopMegaMenu } from "@/components/navigation/shop-mega-menu";
import { BusinessMenu } from "@/components/navigation/business-menu";
import { Wordmark } from "@/components/marketing/wordmark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ManagedNavLinks } from "@/components/navigation/managed-nav-links";
import { MobileMenu } from "@/components/navigation/mobile-menu";
import { HeaderSearch } from "@/components/navigation/header-search";
import { buildShopMenuColumns } from "@/components/navigation/shop-menu-model";
import { FALLBACK_NAVIGATION, listActiveNavigation } from "@/features/content";
import { listDivisionCategories } from "@/features/catalogue";
import { uniqueNavigationLinks } from "./navigation-model";

export async function StoreHeader() {
  const [managedLinks, categories] = await Promise.all([
    listActiveNavigation("header"),
    listDivisionCategories().catch(() => []),
  ]);
  const links = managedLinks.length ? managedLinks : FALLBACK_NAVIGATION.header;
  const additionalManagedLinks = uniqueNavigationLinks(
    links.filter((link) => !["/shop", "/about", "/contact"].includes(link.href)),
  );
  return (
    <header className="relative sticky top-0 z-50 border-b border-border/80 bg-card/90 shadow-[0_4px_18px_rgba(16,42,67,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-3 py-2.5 sm:gap-5 sm:px-6 sm:py-3.5 lg:px-8">
        <Wordmark />
        <nav
          className="hidden items-center gap-3 text-sm text-graphite lg:flex lg:gap-4"
          aria-label="Primary"
        >
          <ShopMegaMenu columns={buildShopMenuColumns(categories)} />
          <BusinessMenu />
          <ManagedNavLinks links={[{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }]} />
          {additionalManagedLinks.length ? <ManagedNavLinks links={additionalManagedLinks} /> : null}
        </nav>
        <HeaderSearch />
        <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
          <Link href="/request-quote" className="hidden min-h-11 items-center rounded-md bg-ink px-3 text-sm font-semibold text-white transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:inline-flex">Request a Quote</Link>
          <AccountLink />
          <ThemeToggle />
          <DualPathCounts />
          <MobileMenu categories={categories} />
        </div>
      </div>
    </header>
  );
}
