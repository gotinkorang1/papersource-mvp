"use client";

import Image from "next/image";
import { useState } from "react";

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
  return (
    <div>
      <div
        className="relative aspect-square overflow-hidden border border-border bg-cream"
        role="img"
        aria-label={alt}
      >
        {active ? <Image src={active.src} alt={active.alt} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-6" /> : <div className="m-8 h-[calc(100%-4rem)] border border-border bg-card" />}
      </div>
      {gallery.length > 1 ? <div className="mt-3 grid grid-cols-4 gap-2" aria-label="Product images">
        {gallery.map((image, index) => <button key={`${image.src}-${index}`} type="button" aria-label={`View image ${index + 1}`} aria-pressed={index === activeIndex} onClick={() => setActiveIndex(index)} className={`relative aspect-square overflow-hidden rounded-md border-2 bg-cream transition ${index === activeIndex ? "border-ochre ring-2 ring-ochre/30" : "border-border hover:border-ink"}`}><Image src={image.src} alt="" fill sizes="96px" className="object-contain p-1" /></button>)}
      </div> : null}
    </div>
  );
}
