import type { ComponentProps } from "react";
import { paperButton } from "@/components/commerce/paper-button";
import { cn } from "@/lib/utils";

export function ProcurementCTA({
  className,
  children = "Start a Quote",
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(paperButton({ variant: "accent" }), className)}
      {...props}
    >
      {children}
    </button>
  );
}
