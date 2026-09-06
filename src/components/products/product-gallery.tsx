"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  alt,
  src,
  frames = 3,
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
                "h-14 w-14 border bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
                active === index ? "border-ink" : "border-border",
              )}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
