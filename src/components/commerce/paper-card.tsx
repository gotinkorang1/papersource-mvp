import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function PaperCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "surface-lift touch-manipulation rounded-xl border border-border/80 bg-card text-card-foreground shadow-[0_1px_2px_rgba(16,42,67,0.04)] transition-[transform,box-shadow,border-color] duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:border-ink/15 active:scale-[0.995] focus-within:border-paper-green/50 focus-within:ring-2 focus-within:ring-paper-green/15",
        className,
      )}
      {...props}
    />
  );
}
