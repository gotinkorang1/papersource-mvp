"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  { eyebrow: "For growing teams", title: "Set up every new desk with confidence.", body: "Starter packs make onboarding simple, consistent and ready for the first day.", image: "/images/young-african-business-woman-standing-grey-wall.jpg", alt: "Professional ready to start a workday", href: "/shop/workplace" },
  { eyebrow: "For classrooms", title: "Keep learning moving.", body: "Practical stationery and classroom essentials for teachers, learners and administrators.", image: "/images/cheerful-teen-holding-big-pencil.jpg", alt: "Student holding a large pencil", href: "/shop/school-supplies" },
  { eyebrow: "For print rooms", title: "The right stock, on hand.", body: "Paper, ink and toner for everyday print runs, with bulk pricing when you need it.", image: "/images/home-printer-based-toner.jpg", alt: "Printer and toner supplies", href: "/shop/printing" },
] as const;

export function WorkdayCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const slide = slides[active];
  const move = (direction: -1 | 1) => setActive((index) => (index + direction + slides.length) % slides.length);

  return (
    <section aria-label="PaperSource solutions" className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-ink text-cream shadow-[0_18px_48px_rgba(16,42,67,0.18)]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
        <div className="grid md:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center p-6 pb-16 sm:p-10 sm:pb-16 md:p-12 md:pb-12">
            <p className="text-xs font-semibold tracking-[0.18em] text-ochre uppercase">{slide.eyebrow}</p>
            <h2 className="mt-4 max-w-lg text-3xl text-cream sm:text-4xl">{slide.title}</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/75 sm:text-base">{slide.body}</p>
            <Link href={slide.href} className="mt-7 inline-flex w-fit items-center gap-2 rounded-lg bg-ochre px-4 py-2.5 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-ochre/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ochre">Explore the range <ArrowRight className="size-4" aria-hidden /></Link>
          </div>
          <div className="relative aspect-[16/10] min-h-52 bg-cream md:aspect-auto md:min-h-[22rem]">
            <Image key={slide.image} src={slide.image} alt={slide.alt} fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover motion-safe:animate-in motion-safe:fade-in-0" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink/10 to-transparent md:from-ink/20" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-cream/15 bg-ink/40 px-6 py-4 sm:px-10 md:px-12">
          <p className="text-xs font-medium text-cream/60">Explore PaperSource solutions</p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => move(-1)} aria-label="Previous slide" className="inline-flex size-9 items-center justify-center rounded-full border border-cream/30 text-cream transition hover:bg-cream/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ochre"><ChevronLeft className="size-4" aria-hidden /></button>
            <div className="flex gap-1.5" role="tablist" aria-label="Choose solution slide">{slides.map((entry, index) => <button key={entry.eyebrow} type="button" role="tab" aria-selected={index === active} aria-label={`Show ${entry.eyebrow}`} onClick={() => setActive(index)} className={`h-1.5 rounded-full transition-all ${index === active ? "w-7 bg-ochre" : "w-2 bg-cream/45 hover:bg-cream/75"}`} />)}</div>
            <button type="button" onClick={() => move(1)} aria-label="Next slide" className="inline-flex size-9 items-center justify-center rounded-full border border-cream/30 text-cream transition hover:bg-cream/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ochre"><ChevronRight className="size-4" aria-hidden /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
