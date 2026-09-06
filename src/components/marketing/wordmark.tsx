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
      <span className="border-2 border-ink/15 bg-cream px-2 py-1 font-heading text-[1.05rem] font-bold leading-none tracking-[0.16em] text-ink shadow-[3px_3px_0_#e6a329] transition-colors group-hover:border-paper-green sm:px-2.5 sm:py-1.5 sm:text-lg">
        <span>PAPER</span><span className={inverted ? "text-ochre" : "text-paper-green"}>SOURCE</span>
      </span>
    </Link>
  );
}
