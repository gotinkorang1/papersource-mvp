import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function PaperCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "surface-lift rounded-xl border border-border/80 bg-card text-card-foreground shadow-[0_1px_2px_rgba(16,42,67,0.04)] transition-[transform,box-shadow,border-color] duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:border-ink/15",
        className,
      )}
      {...props}
    />
  );
}
