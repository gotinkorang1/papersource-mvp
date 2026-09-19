"use client";

import { LayoutGrid, List, Rows3, SquareStack } from "lucide-react";
import { cn } from "@/lib/utils";

export type CatalogueViewMode = "default" | "grid" | "list" | "content";

const modes: Array<{
  value: CatalogueViewMode;
  label: string;
  Icon: typeof LayoutGrid;
}> = [
  { value: "default", label: "Default", Icon: SquareStack },
  { value: "grid", label: "Grid", Icon: LayoutGrid },
  { value: "list", label: "List", Icon: List },
  { value: "content", label: "Content", Icon: Rows3 },
];

export function CatalogueViewModeControl({
  value,
  onChange,
  compact = false,
}: {
  value: CatalogueViewMode;
  onChange: (value: CatalogueViewMode) => void;
  compact?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label="Catalogue display"
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm",
        compact ? "w-fit" : "w-full sm:w-fit",
      )}
    >
      {modes.map(({ value: mode, label, Icon }) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            aria-pressed={active}
            aria-label={label}
            title={`${label} view`}
            onClick={() => onChange(mode)}
            className={cn(
              "inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:flex-none sm:text-sm",
              active
                ? "bg-ink text-paper shadow-sm"
                : "text-slate hover:bg-muted hover:text-ink",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className={cn(compact && "sr-only sm:not-sr-only")}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
