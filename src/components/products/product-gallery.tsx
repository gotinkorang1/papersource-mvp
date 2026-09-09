"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function ProductGallery({
  alt,
  src,
  images,
}: {
  alt: string;
  src?: string;
  images?: { src: string; alt: string }[];
}) {
  const gallery = images?.length ? images : src ? [{ src, alt }] : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = gallery[activeIndex] ?? gallery[0];
  useEffect(() => {
    if (gallery.length < 2) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.key === "ArrowLeft") setActiveIndex((index) => (index - 1 + gallery.length) % gallery.length);
      if (event.key === "ArrowRight") setActiveIndex((index) => (index + 1) % gallery.length);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gallery.length]);
  return (
    <div>
      <div
        className="relative aspect-square overflow-hidden border border-border bg-cream"
        role="img"
        aria-label={alt}
      >
        {active ? <>
          <Image src={active.src} alt={active.alt} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-6" />
          {gallery.length > 1 ? <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-white" aria-live="polite">{activeIndex + 1} of {gallery.length}</span> : null}
          {gallery.length > 1 ? <>
            <button type="button" aria-label="Previous product image" onClick={() => setActiveIndex((activeIndex - 1 + gallery.length) % gallery.length)} className="absolute left-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-xl text-ink shadow-sm backdrop-blur transition hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">‹</button>
            <button type="button" aria-label="Next product image" onClick={() => setActiveIndex((activeIndex + 1) % gallery.length)} className="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-xl text-ink shadow-sm backdrop-blur transition hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">›</button>
          </> : null}
        </> : <div className="m-8 h-[calc(100%-4rem)] border border-border bg-card" />}
      </div>
      {gallery.length > 1 ? <div className="mt-3 grid grid-cols-4 gap-2" aria-label="Product images">
        {gallery.map((image, index) => <button key={`${image.src}-${index}`} type="button" aria-label={`View image ${index + 1}`} aria-pressed={index === activeIndex} onClick={() => setActiveIndex(index)} className={`relative aspect-square overflow-hidden rounded-md border-2 bg-cream transition ${index === activeIndex ? "border-ochre ring-2 ring-ochre/30" : "border-border hover:border-ink"}`}><Image src={image.src} alt="" fill sizes="96px" className="object-contain p-1" /></button>)}
      </div> : null}
    </div>
  );
}
