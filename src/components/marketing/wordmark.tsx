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
      <span className="font-heading text-[1.05rem] font-bold leading-none tracking-[0.16em] transition-colors group-hover:text-paper-green sm:text-lg">
        <span>PAPER</span><span className={inverted ? "text-ochre" : "text-paper-green"}>SOURCE</span>
      </span>
    </Link>
  );
}
