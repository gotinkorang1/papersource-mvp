"use client";

import Image from "next/image";

export function ProductGallery({
  alt,
  src,
}: {
  alt: string;
  src?: string;
}) {
  return (
    <div>
      <div
        className="relative aspect-square overflow-hidden border border-border bg-cream"
        role="img"
        aria-label={alt}
      >
        {src ? <Image src={src} alt={alt} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-6" /> : <div className="m-8 h-[calc(100%-4rem)] border border-border bg-card" />}
      </div>
    </div>
  );
}
