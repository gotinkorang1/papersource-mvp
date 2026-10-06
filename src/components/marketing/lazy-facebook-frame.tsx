"use client";

import { useEffect, useRef, useState } from "react";

type LazyFacebookFrameProps = {
  src: string;
  title: string;
  className: string;
  minHeight: number;
};

/**
 * Keep Meta's iframe out of the initial network waterfall. The placeholder
 * reserves its space, then the iframe is mounted shortly before it enters the
 * viewport so the social feed remains available without delaying LCP.
 */
export function LazyFacebookFrame({ src, title, className, minHeight }: LazyFacebookFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      setReady(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ minHeight }}>
      {ready ? (
        <iframe
          title={title}
          src={src}
          loading="lazy"
          scrolling="no"
          frameBorder="0"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="clipboard-write; encrypted-media; picture-in-picture; web-share"
          className={className}
        />
      ) : (
        <div aria-hidden="true" className="grid h-full min-h-[220px] place-items-center rounded-xl border border-border bg-card text-xs text-slate">
          Social updates load as you reach this section.
        </div>
      )}
    </div>
  );
}
