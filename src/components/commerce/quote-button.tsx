import type { ComponentProps } from "react";
import { paperButton } from "@/components/commerce/paper-button";
import { cn } from "@/lib/utils";

export function QuoteButton({
  className,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(paperButton({ variant: "quote" }), className)}
      {...props}
    />
  );
}
