import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function PaperCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-[0_1px_2px_rgba(16,42,67,0.04)] transition-[transform,box-shadow,border-color] duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_10px_24px_rgba(16,42,67,0.09)]",
        className,
      )}
      {...props}
    />
  );
}
