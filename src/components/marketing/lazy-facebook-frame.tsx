"use client";

import { useEffect, useRef, useState } from "react";

type LazyFacebookFrameProps = {
  src: string;
  title: string;
  className: string;
  minHeight: number;
  themeAware?: boolean;
};

/**
 * Keep Meta's iframe out of the initial network waterfall. The placeholder
 * reserves its space, then the iframe is mounted shortly before it enters the
 * viewport so the social feed remains available without delaying LCP.
 */
export function LazyFacebookFrame({ src, title, className, minHeight, themeAware = false }: LazyFacebookFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState(src);

  useEffect(() => {
    if (!themeAware) return;

    const updateTheme = () => {
      try {
        const url = new URL(src);
        url.searchParams.set("colorscheme", document.documentElement.classList.contains("dark") ? "dark" : "light");
        setResolvedSrc(url.toString());
      } catch {
        setResolvedSrc(src);
      }
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [src, themeAware]);

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
          src={resolvedSrc}
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
