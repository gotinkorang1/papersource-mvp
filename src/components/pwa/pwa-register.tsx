"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function isIosInstallable({ platform, userAgent, standalone, touchPoints = 0 }: { platform: string; userAgent: string; standalone: boolean; touchPoints?: number }) {
  const ios = /iPad|iPhone|iPod/.test(platform) || (platform === "MacIntel" && touchPoints > 1);
  return ios && /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS/i.test(userAgent) && !standalone;
}

export function PwaRegister() {
  const pathname = usePathname();
  const admin = pathname.startsWith("/admin");
  const dismissKey = admin ? "papersource-admin-install-dismissed" : "papersource-install-dismissed";
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => typeof window !== "undefined" && sessionStorage.getItem(admin ? "papersource-admin-install-dismissed" : "papersource-install-dismissed") === "1");
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [iosInstall, setIosInstall] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const iosStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    const iosInstallable = isIosInstallable({ platform: navigator.platform, userAgent: navigator.userAgent, standalone: iosStandalone, touchPoints: navigator.maxTouchPoints });
    const iosTimeout = window.setTimeout(() => setIosInstall(iosInstallable), 0);
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
      sessionStorage.setItem(dismissKey, "1");
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
      window.clearTimeout(iosTimeout);
      window.removeEventListener("beforeinstallprompt", onInstall);
      window.removeEventListener("appinstalled", onInstalled);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [admin, dismissKey]);

  if (updateAvailable) {
    return <div className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-4 text-sm text-ink shadow-[0_18px_44px_rgba(16,42,67,0.2)] sm:inset-x-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"><p><span className="font-semibold">PaperSource updated</span><span className="mt-0.5 block text-xs text-slate">Refresh to use the latest version.</span></p><button type="button" onClick={() => { let timeout = 0; const reload = () => { window.clearTimeout(timeout); window.location.reload(); }; navigator.serviceWorker.addEventListener("controllerchange", reload, { once: true }); void navigator.serviceWorker.ready.then((registration) => { registration.waiting?.postMessage({ type: "SKIP_WAITING" }); }); timeout = window.setTimeout(reload, 2500); }} className="min-h-11 w-full shrink-0 rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white hover:bg-ink/90 sm:w-auto">Refresh</button></div>;
  }
  if ((!installEvent && !iosInstall) || dismissed) return null;
  if (iosInstall && !installEvent) return <div className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-md rounded-xl border border-border bg-card p-4 text-sm text-ink shadow-[0_18px_44px_rgba(16,42,67,0.2)] sm:inset-x-4 md:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-ochre bg-ink text-xs font-bold tracking-[0.12em] text-cream" aria-hidden="true">PS</span><p className="min-w-0 flex-1"><span className="font-semibold">Add PaperSource to your Home Screen</span><span className="mt-0.5 block text-xs leading-5 text-slate">Tap Share, then choose <strong className="font-medium text-ink">Add to Home Screen</strong> for one-tap access.</span></p><button type="button" aria-label="Dismiss install instructions" onClick={() => { sessionStorage.setItem("papersource-install-dismissed", "1"); setDismissed(true); }} className="min-h-11 min-w-11 rounded-md px-2 py-1 text-lg leading-none text-slate hover:text-ink">×</button></div></div>;
  const promptEvent = installEvent;
  return (
    <div className="fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-md flex-col gap-3 rounded-xl border border-border bg-card p-4 text-sm text-ink shadow-[0_18px_44px_rgba(16,42,67,0.2)] sm:inset-x-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-ochre bg-ink text-xs font-bold tracking-[0.12em] text-cream" aria-hidden="true">PS</span><p><span className="font-semibold">Install PaperSource</span><span className="mt-0.5 block text-xs text-slate">Shop, search and quote in one tap.</span></p></div>
      <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto"><button type="button" onClick={() => { sessionStorage.setItem("papersource-install-dismissed", "1"); setDismissed(true); }} className="min-h-11 rounded-md px-2 py-2 text-xs text-slate hover:text-ink">Not now</button><button type="button" onClick={() => { if (promptEvent) void promptEvent.prompt(); setInstallEvent(null); }} className="min-h-11 rounded-md bg-ink px-3 py-2 text-xs font-semibold text-white hover:bg-ink/90">Install</button></div>
    </div>
  );
}

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void> };
