import { cn } from "@/lib/utils";
import type { StockLevel } from "@/types/catalogue";

const copy: Record<StockLevel, { label: string; className: string }> = {
  in_stock: { label: "In stock", className: "text-paper-green" },
  low: { label: "Low stock", className: "text-ochre" },
  out: { label: "Out of stock", className: "text-error" },
};

export function StockBadge({ level }: { level: StockLevel }) {
  const item = copy[level];

  return (
    <p className={cn("text-sm", item.className)}>
      {level === "in_stock" ? "✓ " : null}
      {item.label}
    </p>
  );
}
