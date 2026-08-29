import Link from "next/link";
import { cn } from "@/lib/utils";

export function CategoryTile({
  name,
  caption,
  href,
  className,
}: {
  name: string;
  caption?: string;
  href: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-36 flex-col justify-between border-border bg-card p-5 transition-colors hover:bg-cream",
        className,
      )}
    >
      <span
        aria-hidden
        className="mb-8 h-16 border border-dashed border-border bg-cream"
      />
      <span>
        <span className="block text-base font-medium text-ink">{name}</span>
        {caption ? (
          <span className="mt-1 block text-sm text-slate">{caption}</span>
        ) : null}
      </span>
    </Link>
  );
}
