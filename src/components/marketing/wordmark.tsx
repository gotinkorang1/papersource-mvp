"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Wordmark({
  href = "/",
  inverted = false,
  shrinkOnScroll = true,
  className,
}: {
  href?: string;
  inverted?: boolean;
  shrinkOnScroll?: boolean;
  className?: string;
}) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 56);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Link
      href={href}
      aria-label="PaperSource home"
      className={cn(
        "group inline-flex items-center gap-2 transition-transform duration-300 ease-out",
        shrinkOnScroll && isScrolled ? "scale-[0.88]" : "scale-100",
        inverted ? "text-cream" : "text-ink",
        className,
      )}
    >
      <span className="border-2 border-ink/15 bg-cream px-2 py-1 font-heading text-[1.05rem] font-bold leading-none tracking-[0.16em] text-ink shadow-[3px_3px_0_#e6a329] transition-[padding,box-shadow,border-color] duration-300 group-hover:border-paper-green sm:px-2.5 sm:py-1.5 sm:text-lg">
        <span className={cn("inline-block transition-[max-width,opacity] duration-300", shrinkOnScroll && isScrolled ? "max-w-0 overflow-hidden opacity-0" : "max-w-[4.5em] opacity-100")} aria-hidden={shrinkOnScroll && isScrolled}>
          PAPER
        </span>
        <span className={cn("transition-colors", inverted ? "text-ochre" : "text-paper-green")}>
          {shrinkOnScroll && isScrolled ? "PS" : "SOURCE"}
        </span>
      </span>
    </Link>
  );
}
