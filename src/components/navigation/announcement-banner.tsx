import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

export function AnnouncementBanner() {
  return (
    <div className="bg-ink px-4 py-2.5 text-center text-xs text-cream sm:text-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
        <Sparkles className="size-3.5 shrink-0 text-ochre" aria-hidden />
        <span>Workplace essentials, delivered across Accra &amp; Tema.</span>
        <Link href="/delivery" className="inline-flex items-center gap-1 font-semibold text-ochre underline-offset-4 hover:underline">
          See delivery zones <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
