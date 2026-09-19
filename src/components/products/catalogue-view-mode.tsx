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
        "grid w-full grid-cols-4 items-stretch gap-1 rounded-xl border border-border bg-card p-1 shadow-sm sm:inline-flex sm:w-fit sm:items-center",
        compact ? "sm:w-fit" : "sm:w-fit",
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
              "inline-flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-[0.68rem] font-semibold leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:min-h-10 sm:flex-row sm:gap-2 sm:px-3 sm:text-sm",
              active
                ? "bg-ink text-paper shadow-sm"
                : "text-slate hover:bg-muted hover:text-ink",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
