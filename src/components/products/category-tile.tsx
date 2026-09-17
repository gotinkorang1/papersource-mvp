import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
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
        "surface-lift group flex min-h-40 flex-col justify-between rounded-2xl border border-border/80 bg-card p-3.5 transition-[background-color,transform,box-shadow] duration-300 ease-out hover:bg-cream hover:shadow-lg motion-safe:hover:-translate-y-1 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:p-4",
        className,
      )}
    >
      <span className="relative mb-5 aspect-[1.65/1] overflow-hidden rounded-xl border border-border bg-cream transition-colors duration-300 group-hover:border-ink/30">
        <Image src={imageSrc ?? "/images/catalogue-stationery-generated.png"} alt={imageAlt || `${name} workplace supplies`} fill sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 240px" className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105" />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
        <span aria-hidden className="absolute bottom-2 right-2 grid size-8 place-items-center rounded-full bg-card/90 text-ink shadow-sm backdrop-blur-sm transition-transform duration-300 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"><ArrowUpRight className="size-4" /></span>
      </span>
      <span>
        <span className="block text-base font-semibold tracking-tight text-ink">{name}</span>
        {caption ? (
          <span className="mt-1 line-clamp-2 block text-sm leading-5 text-slate">{caption}</span>
        ) : null}
      </span>
    </Link>
  );
}
