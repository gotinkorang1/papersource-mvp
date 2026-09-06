"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  alt,
  src,
  frames = 1,
}: {
  alt: string;
  src?: string;
  frames?: number;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div
        className="relative aspect-square overflow-hidden border border-border bg-cream"
        role="img"
        aria-label={alt}
      >
        {src ? <Image src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-6" /> : <div className="m-8 h-[calc(100%-4rem)] border border-border bg-card" />}
      </div>
      <ul className="mt-3 flex gap-2">
        {Array.from({ length: frames }, (_, index) => (
          <li key={index}>
            <button
              type="button"
              aria-label={`View image ${index + 1}`}
              aria-current={active === index}
              onClick={() => setActive(index)}
              className={cn(
                "relative h-14 w-14 overflow-hidden border bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
                active === index ? "border-ink" : "border-border",
              )}
            >
              {src ? <Image src={src} alt="" fill sizes="56px" className="object-cover" /> : <span className="sr-only">Image {index + 1}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
