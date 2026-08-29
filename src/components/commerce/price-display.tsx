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
  return (
    <p className={cn("text-base font-medium text-ink tabular-nums", className)}>
      {formatGhs(pesewas)}
      {unitLabel ? (
        <span className="font-normal text-slate"> / {unitLabel}</span>
      ) : null}
    </p>
  );
}
