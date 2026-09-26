"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export function dedupeProductImages(images: { src: string; alt: string }[]) {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (!image.src || seen.has(image.src)) return false;
    seen.add(image.src);
    return true;
  });
}

export function ProductGallery({
  alt,
  src,
  images,
}: {
  alt: string;
  src?: string;
  images?: { src: string; alt: string }[];
}) {
  const gallery = images?.length ? dedupeProductImages(images) : src ? [{ src, alt }] : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const active = gallery[activeIndex] ?? gallery[0];
  const moveImage = useCallback((direction: 1 | -1) => setActiveIndex((index) => (index + direction + gallery.length) % gallery.length), [gallery.length]);
  useEffect(() => {
    // Keep the active thumbnail valid if images are edited while the page stays mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveIndex((index) => Math.min(index, Math.max(0, gallery.length - 1)));
  }, [gallery.length]);
  useEffect(() => {
    if (gallery.length < 2) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || !galleryRef.current?.contains(target) || target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        moveImage(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        moveImage(1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gallery.length, moveImage]);
  return (
    <div className="mx-auto w-full max-w-xl">
      <div
        ref={galleryRef}
        className="relative aspect-[4/5] touch-pan-y overflow-hidden border border-border bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:aspect-square"
        role="region"
        aria-roledescription="carousel"
        aria-label={`${alt} image gallery`}
        tabIndex={0}
        onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
        onTouchEnd={(event) => { const start = touchStartX.current; touchStartX.current = null; const end = event.changedTouches[0]?.clientX; if (start === null || end === undefined || gallery.length < 2) return; const distance = end - start; if (Math.abs(distance) > 40) moveImage(distance > 0 ? -1 : 1); }}
      >
        {active ? <>
          <Image src={active.src} alt={active.alt} fill preload loading="eager" fetchPriority="high" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 50vw" onError={(event) => { event.currentTarget.src = "/images/catalogue-stationery-generated.png"; }} className="object-contain p-4 sm:p-8" />
          {gallery.length > 1 ? <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-white" aria-live="polite">{activeIndex + 1} of {gallery.length}</span> : null}
          {gallery.length > 1 ? <>
            <button type="button" aria-label="Previous product image" onClick={() => setActiveIndex((activeIndex - 1 + gallery.length) % gallery.length)} className="absolute left-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-xl text-ink shadow-sm backdrop-blur transition hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">‹</button>
            <button type="button" aria-label="Next product image" onClick={() => setActiveIndex((activeIndex + 1) % gallery.length)} className="absolute right-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-xl text-ink shadow-sm backdrop-blur transition hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">›</button>
          </> : null}
        </> : <div className="m-8 h-[calc(100%-4rem)] border border-border bg-card" />}
      </div>
      {gallery.length > 1 ? <div className="mt-3 grid grid-cols-4 gap-2 sm:mt-4" aria-label="Product images">
        {gallery.map((image, index) => <button key={`${image.src}-${index}`} type="button" aria-label={`View image ${index + 1}`} aria-pressed={index === activeIndex} onClick={() => setActiveIndex(index)} className={`relative aspect-square overflow-hidden rounded-md border-2 bg-cream transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${index === activeIndex ? "border-ochre ring-2 ring-ochre/30" : "border-border hover:border-ink"}`}><Image src={image.src} alt="" fill sizes="96px" className="object-contain p-1" /></button>)}
      </div> : null}
    </div>
  );
}
