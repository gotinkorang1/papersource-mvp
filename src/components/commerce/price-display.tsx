import { formatGhs } from "@/lib/money";
import { cn } from "@/lib/utils";

export function PriceDisplay({
  pesewas,
  unitLabel,
  className,
}: {
  pesewas: number;
  unitLabel?: string;
  className?: string;
}) {
  const normalizedUnitLabel = unitLabel?.replace(/^\s*\/\s*/, "").trim();

  return (
    <p className={cn("whitespace-nowrap text-base font-medium leading-tight text-ink tabular-nums", className)}>
      {formatGhs(pesewas)}
      {normalizedUnitLabel ? (
        <span className="font-normal text-slate"> / {normalizedUnitLabel}</span>
      ) : null}
    </p>
  );
}
