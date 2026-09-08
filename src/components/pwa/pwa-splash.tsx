"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type StandaloneState = { matches?: boolean; iosStandalone?: boolean };

export function isStandaloneDisplayMode({ matches = false, iosStandalone = false }: StandaloneState) {
  return matches || iosStandalone;
}

export function PwaSplash() {
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(display-mode: standalone)");
    const iosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    const splashKey = admin ? "papersource-admin-pwa-splash" : "papersource-pwa-splash";
    if (!isStandaloneDisplayMode({ matches: media.matches, iosStandalone }) || sessionStorage.getItem(splashKey) === "1") return;

    sessionStorage.setItem(splashKey, "1");
    const showTimeout = window.setTimeout(() => setVisible(true), 0);
    const hideTimeout = window.setTimeout(() => setVisible(false), 700);
    return () => {
      window.clearTimeout(showTimeout);
      window.clearTimeout(hideTimeout);
    };
  }, [admin]);

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#102a43] text-[#f8f6f1]" role="status" aria-label={admin ? "Loading PaperSource Operations" : "Loading PaperSource"}>
      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 flex flex-col items-center gap-5">
        <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border-4 border-[#e6a329] bg-[#f8f6f1] text-3xl font-bold tracking-[0.12em] text-[#102a43] shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:h-28 sm:w-28 sm:rounded-[1.75rem] sm:text-4xl" aria-hidden="true">PS</div>
        <p className="text-center text-sm font-semibold tracking-[0.24em] text-[#f3bd4e] uppercase">{admin ? "PaperSource Operations" : "PaperSource"}</p>
      </div>
    </div>
  );
}
