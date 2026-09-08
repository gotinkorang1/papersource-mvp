"use client";

import { useEffect, useState } from "react";

export function PwaRegister() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => typeof window !== "undefined" && sessionStorage.getItem("papersource-install-dismissed") === "1");
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let registration: ServiceWorkerRegistration | undefined;
    void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((nextRegistration) => {
      registration = nextRegistration;
      if (registration.waiting) window.setTimeout(() => setUpdateAvailable(true), 0);
      registration.addEventListener("updatefound", () => {
        const worker = registration?.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) setUpdateAvailable(true);
        });
      });
    }).catch(() => undefined);
    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      sessionStorage.setItem("papersource-install-dismissed", "1");
      setDismissed(true);
      setInstallEvent(null);
    };
    window.addEventListener("beforeinstallprompt", onInstall);
    window.addEventListener("appinstalled", onInstalled);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void registration?.update();
    };
    document.addEventListener("visibilitychange", onVisibilityChange, { passive: true });
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstall);
      window.removeEventListener("appinstalled", onInstalled);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  if (updateAvailable) {
    return <div className="fixed inset-x-4 bottom-20 z-40 mx-auto flex max-w-md items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 text-sm text-ink shadow-[0_18px_44px_rgba(16,42,67,0.2)] md:bottom-6"><p><span className="font-semibold">PaperSource updated</span><span className="mt-0.5 block text-xs text-slate">Refresh to use the latest version.</span></p><button type="button" onClick={() => { let timeout = 0; const reload = () => { window.clearTimeout(timeout); window.location.reload(); }; navigator.serviceWorker.addEventListener("controllerchange", reload, { once: true }); void navigator.serviceWorker.ready.then((registration) => { registration.waiting?.postMessage({ type: "SKIP_WAITING" }); }); timeout = window.setTimeout(reload, 2500); }} className="shrink-0 rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white hover:bg-ink/90">Refresh</button></div>;
  }
  if (!installEvent || dismissed) return null;
  return (
    <div className="fixed inset-x-4 bottom-20 z-40 mx-auto flex max-w-md items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 text-sm text-ink shadow-[0_18px_44px_rgba(16,42,67,0.2)] md:bottom-6">
      <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-ochre bg-ink text-xs font-bold tracking-[0.12em] text-cream" aria-hidden="true">PS</span><p><span className="font-semibold">Install PaperSource</span><span className="mt-0.5 block text-xs text-slate">Shop, search and quote in one tap.</span></p></div>
      <div className="flex shrink-0 items-center gap-2"><button type="button" onClick={() => { sessionStorage.setItem("papersource-install-dismissed", "1"); setDismissed(true); }} className="rounded-md px-2 py-2 text-xs text-slate hover:text-ink">Not now</button><button type="button" onClick={() => { void installEvent.prompt(); setInstallEvent(null); }} className="rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white hover:bg-ink/90">Install</button></div>
    </div>
  );
}

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void> };
