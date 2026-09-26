"use client";

import { cn } from "@/lib/utils";

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 9999,
  disabled = false,
  id,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  id?: string;
}) {
  function clamp(next: number) {
    return Math.min(max, Math.max(min, next));
  }

  return (
    <div className="inline-flex items-stretch overflow-hidden rounded-md border border-border bg-card">
      <button
        type="button"
        className="min-h-11 min-w-11 px-3 text-ink transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10);
          if (Number.isNaN(parsed)) {
            return;
          }
          onChange(clamp(parsed));
        }}
        className={cn(
          "h-11 w-14 border-x border-border bg-card text-center text-sm tabular-nums text-ink transition-colors [appearance:textfield]",
          "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink",
          "disabled:cursor-not-allowed disabled:opacity-40 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        )}
        aria-label="Quantity"
      />
      <button
        type="button"
        className="min-h-11 min-w-11 px-3 text-ink transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
