"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/marketing/brand-mark";

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

  const compact = shrinkOnScroll && isScrolled;

  return (
    <Link
      href={href}
      aria-label="PaperSource home"
      className={cn(
        "group inline-flex items-center gap-2 transition-transform duration-300 ease-out",
        compact ? "scale-[0.92]" : "scale-100",
        className,
      )}
    >
      {/* Collapse to the mark alone once the page scrolls to keep the sticky header compact. */}
      <BrandMark variant="mark" tone={inverted ? "dark" : "auto"} className={cn("h-10 sm:h-11", compact ? "inline-flex" : "hidden")} />
      <BrandMark variant="lockup" tone={inverted ? "dark" : "auto"} priority className={cn("h-8 sm:h-10", compact ? "hidden" : "inline-flex")} />
    </Link>
  );
}
