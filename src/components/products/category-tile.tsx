import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function CategoryTile({
  name,
  caption,
  href,
  imageSrc,
  imageAlt = "",
  className,
}: {
  name: string;
  caption?: string;
  href: string;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "surface-lift group flex min-h-36 flex-col justify-between rounded-xl border border-border/80 bg-card p-5 transition-[background-color,transform] duration-300 ease-out hover:bg-cream motion-safe:hover:-translate-y-1 focus-visible:z-10",
        className,
      )}
    >
      <span className="relative mb-8 h-24 overflow-hidden rounded-lg border border-dashed border-border bg-cream transition-colors duration-300 group-hover:border-ink/30">
        {imageSrc ? <Image src={imageSrc} alt={imageAlt} fill sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 240px" className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105" /> : null}
      </span>
      <span>
        <span className="block text-base font-medium text-ink">{name}</span>
        {caption ? (
          <span className="mt-1 block text-sm text-slate">{caption}</span>
        ) : null}
      </span>
    </Link>
  );
}
