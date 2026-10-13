"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { readSessionFlag, writeSessionFlag } from "@/lib/browser/session-storage";
import { BrandMark } from "@/components/marketing/brand-mark";

type StandaloneState = { matches?: boolean; iosStandalone?: boolean };

export function isStandaloneDisplayMode({ matches = false, iosStandalone = false }: StandaloneState) {
  return matches || iosStandalone;
}

export function PwaSplash() {
  const pathname = usePathname();
  const admin = (pathname ?? "").startsWith("/admin");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const iosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    const splashKey = admin ? "papersource-admin-pwa-splash" : "papersource-pwa-splash";
    if (!isStandaloneDisplayMode({ matches: media.matches, iosStandalone }) || readSessionFlag(splashKey)) return;

    writeSessionFlag(splashKey);
    const showTimeout = window.setTimeout(() => setVisible(true), 0);
    const hideTimeout = window.setTimeout(() => setVisible(false), 700);
    return () => {
      window.clearTimeout(showTimeout);
      window.clearTimeout(hideTimeout);
    };
  }, [admin]);

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-ink text-cream" role="status" aria-label={admin ? "Loading PaperSource Operations" : "Loading PaperSource"}>
      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 flex flex-col items-center gap-5">
        <BrandMark tone="inverse" priority className="h-24 sm:h-28" />
        <p className="text-center text-sm font-semibold tracking-[0.24em] text-ochre uppercase">{admin ? "PaperSource Operations" : "PaperSource"}</p>
      </div>
    </div>
  );
}
