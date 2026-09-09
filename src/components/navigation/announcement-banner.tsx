import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

export function AnnouncementBanner() {
  return (
    <div role="region" aria-label="Delivery announcement" className="bg-ink px-3 py-2.5 text-center text-xs leading-tight text-cream sm:px-4 sm:text-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <Sparkles className="size-3.5 shrink-0 text-ochre" aria-hidden />
        <span className="sm:hidden">Work essentials in Accra &amp; Tema.</span>
        <span className="hidden sm:inline">Workplace essentials, delivered across Accra &amp; Tema.</span>
        <Link href="/delivery" className="inline-flex shrink-0 items-center gap-1 font-semibold text-ochre underline-offset-4 hover:underline">
          See delivery zones <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
