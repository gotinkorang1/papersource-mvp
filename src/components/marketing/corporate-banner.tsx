import Link from "next/link";
import { paperButton } from "@/components/commerce/paper-button";
import { cn } from "@/lib/utils";

export function CorporateBanner({
  title,
  body,
  href = "/quote",
  cta = "Start a Quote",
  className,
}: {
  title: string;
  body: string;
  href?: string;
  cta?: string;
  className?: string;
}) {
  return (
    <section className={cn("bg-ink py-16 text-cream md:py-24", className)}>
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="max-w-2xl text-3xl md:text-5xl">{title}</h2>
        <p className="mt-4 max-w-xl text-cream/80">{body}</p>
        <Link
          href={href}
          className={cn(paperButton({ variant: "accent" }), "mt-10 inline-flex")}
        >
          {cta}
        </Link>
      </div>
    </section>
  );
}
