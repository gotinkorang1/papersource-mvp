import { cn } from "@/lib/utils";
import type { StockLevel } from "@/types/catalogue";

const copy: Record<StockLevel, { label: string; className: string }> = {
  in_stock: { label: "In stock", className: "bg-paper-green/10 text-paper-green" },
  low: { label: "Low stock", className: "bg-ochre/15 text-ink" },
  out: { label: "Out of stock", className: "bg-error/10 text-error" },
};

export function StockBadge({ level }: { level: StockLevel }) {
  const item = copy[level];

  return (
    <p className={cn("inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", item.className)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", level === "in_stock" ? "bg-paper-green" : level === "low" ? "bg-ochre" : "bg-error")} />
      {item.label}
    </p>
  );
}
