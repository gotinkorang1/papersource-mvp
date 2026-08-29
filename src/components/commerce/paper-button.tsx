import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const paperButton = cva(
  "inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-ink text-white hover:bg-ink/90",
        secondary:
          "border border-ink bg-transparent text-ink hover:bg-ink hover:text-white",
        quote:
          "border border-paper-green text-paper-green hover:bg-paper-green hover:text-white",
        accent: "bg-ochre text-ink hover:bg-ochre/90",
        ghost: "text-ink hover:bg-cream",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

type PaperButtonProps = ComponentProps<"button"> &
  VariantProps<typeof paperButton>;

export function PaperButton({
  className,
  variant,
  ...props
}: PaperButtonProps) {
  return (
    <button className={cn(paperButton({ variant }), className)} {...props} />
  );
}
