import { cn } from "@/lib/utils";

export function BrandLogo({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-10 items-center text-sm font-medium tracking-wide text-ink",
        className,
      )}
    >
      {name}
    </span>
  );
}
