import Link from "next/link";
import { paperButton } from "@/components/commerce/paper-button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

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
    <section className={cn("relative isolate overflow-hidden bg-ink py-16 text-cream md:py-24", className)}>
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 -z-10 size-80 rounded-full bg-paper-green/25 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/3 -z-10 size-96 rounded-full bg-ochre/15 blur-3xl" />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8">
        <div><p className="text-xs font-semibold tracking-[0.18em] text-ochre uppercase">Need a tailored plan?</p><h2 className="mt-3 max-w-2xl text-3xl tracking-tight sm:text-4xl md:text-5xl">{title}</h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-cream/80 sm:text-base">{body}</p></div>
        <Link
          href={href}
          className={cn(paperButton({ variant: "accent" }), "inline-flex w-full shrink-0 gap-2 sm:w-fit")}
        >
          {cta} <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
