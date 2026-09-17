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
      <span aria-hidden="true" className="border-2 border-ink/15 bg-cream px-2.5 py-1.5 font-heading text-base font-bold leading-none tracking-[0.16em] text-ink shadow-[3px_3px_0_#e6a329] transition-[padding,box-shadow,border-color] duration-300 group-hover:border-paper-green sm:px-2.5 sm:py-1.5 sm:text-lg">
        <span className={cn("transition-[max-width,opacity] duration-300", isScrolled ? "inline-flex" : "hidden sm:inline-flex")}>
          {isScrolled ? "PS" : "PAPER"}
        </span>
        {!isScrolled ? <span className={cn("hidden transition-colors sm:inline-flex", inverted ? "text-ochre" : "text-paper-green")}>SOURCE</span> : null}
        {!isScrolled ? <span className="inline-flex text-paper-green sm:hidden">PS</span> : null}
      </span>
    </Link>
  );
}
