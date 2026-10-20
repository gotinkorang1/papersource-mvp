"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { readLocalValue, writeLocalValue } from "@/lib/browser/local-storage";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const syncTheme = (saved: string | null) => {
      const prefersDark = typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const next = saved === "dark" || (!saved && prefersDark);
      document.documentElement.classList.toggle("dark", next);
      setDark(next);
    };
    const timer = window.setTimeout(() => syncTheme(readLocalValue("papersource-theme")), 0);
    const onStorage = (event: StorageEvent) => {
      if (event.key === "papersource-theme") syncTheme(event.newValue);
    };
    const media = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const onSystemThemeChange = () => {
      if (!readLocalValue("papersource-theme")) syncTheme(null);
    };
    window.addEventListener("storage", onStorage);
    const legacyMedia = media as (MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    }) | null;
    if (media && typeof media.addEventListener === "function") media.addEventListener("change", onSystemThemeChange);
    else legacyMedia?.addListener?.(onSystemThemeChange);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
      if (media && typeof media.removeEventListener === "function") media.removeEventListener("change", onSystemThemeChange);
      else legacyMedia?.removeListener?.(onSystemThemeChange);
    };
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    writeLocalValue("papersource-theme", next ? "dark" : "light");
    setDark(next);
  }

  return (
    <button type="button" onClick={toggle} aria-label={dark ? "Use light theme" : "Use dark theme"} title={dark ? "Use light theme" : "Use dark theme"} className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-ink transition hover:-translate-y-0.5 hover:border-ink hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
      {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}
