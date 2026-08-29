import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function PaperCard({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card text-card-foreground",
        className,
      )}
      {...props}
    />
  );
}
