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
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Wordmark />
        <nav
          className="hidden items-center gap-5 text-sm text-graphite md:flex"
          aria-label="Primary"
        >
          <ShopMegaMenu />
          <BusinessMenu />
          <Link href="/request-quote" className="rounded-md bg-ochre px-3 py-2 text-sm font-medium text-ink hover:bg-ochre/90">
            Request a Quote
          </Link>
        </nav>
        <HeaderSearch />
        <div className="ml-auto flex items-center gap-4">
          <AccountLink />
          <DualPathCounts />
        </div>
      </div>
    </header>
  );
}
