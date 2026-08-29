import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wordmark({
  href = "/",
  inverted = false,
  className,
}: {
  href?: string;
  inverted?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2",
        inverted ? "text-cream" : "text-ink",
        className,
      )}
    >
      <span aria-hidden className="relative h-6 w-5">
        <span className="absolute inset-x-0 bottom-0 top-1 border border-current bg-transparent" />
        <span className="absolute inset-x-[3px] top-0 bottom-1.5 border border-current bg-current/5" />
      </span>
      <span className="font-heading text-lg font-semibold tracking-[0.12em]">
        PAPERSOURCE
      </span>
    </Link>
  );
}
