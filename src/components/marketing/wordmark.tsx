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
        "group inline-flex items-center gap-2",
        inverted ? "text-cream" : "text-ink",
        className,
      )}
    >
      <span aria-hidden className="relative h-7 w-7 shrink-0">
        <span className="absolute inset-x-1 bottom-0 top-1 rounded-[2px] border-2 border-current bg-current/5" />
        <span className="absolute right-0 top-0 h-1.5 w-4 rotate-[-45deg] rounded-full bg-ochre shadow-[0_0_0_1px_currentColor]" />
        <span className="absolute bottom-1.5 left-2 h-px w-3 bg-current/50" />
        <span className="absolute bottom-2.5 left-2 h-px w-3 bg-current/50" />
      </span>
      <span className="font-heading text-[1.05rem] font-bold leading-none tracking-[0.16em] transition-colors group-hover:text-paper-green sm:text-lg">
        <span>PAPER</span><span className={inverted ? "text-ochre" : "text-paper-green"}>SOURCE</span>
      </span>
    </Link>
  );
}
