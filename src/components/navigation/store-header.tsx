import Link from "next/link";
import { AccountLink } from "@/components/navigation/account-link";
import { DualPathCounts } from "@/components/navigation/dual-path-counts";
import { HeaderSearch } from "@/components/navigation/header-search";
import { ShopMegaMenu } from "@/components/navigation/shop-mega-menu";
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
          <Link href="/brands" className="hover:text-ink">
            Brands
          </Link>
          <Link href="/business" className="hover:text-ink">
            Business
          </Link>
          <Link href="/schools" className="hover:text-ink">
            Schools
          </Link>
          <Link href="/bulk-orders" className="hover:text-ink">
            Bulk Orders
          </Link>
          <Link href="/quick-order" className="hover:text-ink">
            Quick Order
          </Link>
          <Link href="/request-quote" className="hover:text-ink">
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
