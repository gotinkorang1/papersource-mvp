import Link from "next/link";
import { AccountLink } from "@/components/navigation/account-link";
import { DualPathCounts } from "@/components/navigation/dual-path-counts";
import { HeaderSearch } from "@/components/navigation/header-search";
import { ShopMegaMenu } from "@/components/navigation/shop-mega-menu";
import { BusinessMenu } from "@/components/navigation/business-menu";
import { Wordmark } from "@/components/marketing/wordmark";

export function StoreHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6 lg:px-8">
        <Wordmark />
        <nav
          className="hidden items-center gap-3 text-sm text-graphite md:flex lg:gap-4"
          aria-label="Primary"
        >
          <ShopMegaMenu />
          <BusinessMenu />
          <Link href="/request-quote" className="rounded-md bg-ochre px-3 py-2 text-sm font-medium text-ink hover:bg-ochre/90">
            Request a Quote
          </Link>
        </nav>
        <HeaderSearch className="hidden lg:block lg:max-w-md" />
        <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
          <AccountLink />
          <DualPathCounts />
        </div>
      </div>
    </header>
  );
}
