import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const paperButton = cva(
  "inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-[0_5px_14px_rgba(16,42,67,0.14)] hover:-translate-y-px hover:bg-primary/90 hover:shadow-[0_9px_20px_rgba(16,42,67,0.2)]",
        secondary:
          "border border-ink bg-transparent text-ink hover:bg-ink hover:text-white",
        quote:
          "border border-paper-green text-paper-green hover:-translate-y-px hover:bg-paper-green hover:text-white hover:shadow-[0_8px_18px_rgba(31,107,87,0.18)]",
        accent: "bg-ochre text-accent-foreground shadow-[0_5px_14px_rgba(230,163,41,0.18)] hover:-translate-y-px hover:bg-ochre/90",
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
