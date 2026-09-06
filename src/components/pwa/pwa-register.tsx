"use client";

import { useEffect, useState } from "react";

export function PwaRegister() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onInstall);
    return () => window.removeEventListener("beforeinstallprompt", onInstall);
  }, []);

  if (!installEvent || dismissed) return null;
  return (
    <div className="fixed inset-x-4 bottom-20 z-40 mx-auto flex max-w-md items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 text-sm text-ink shadow-[0_18px_44px_rgba(16,42,67,0.2)] md:bottom-6">
      <p><span className="font-semibold">Install PaperSource</span><span className="mt-0.5 block text-xs text-slate">Keep workplace supplies one tap away.</span></p>
      <div className="flex shrink-0 items-center gap-2"><button type="button" onClick={() => setDismissed(true)} className="rounded-md px-2 py-1 text-xs text-slate hover:text-ink">Not now</button><button type="button" onClick={() => { void installEvent.prompt(); setInstallEvent(null); }} className="rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white hover:bg-ink/90">Install</button></div>
    </div>
  );
}

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void> };
