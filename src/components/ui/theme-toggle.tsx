"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDark(document.documentElement.classList.contains("dark")), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("papersource-theme", next ? "dark" : "light");
    setDark(next);
  }

  return (
    <button type="button" onClick={toggle} aria-label={dark ? "Use light theme" : "Use dark theme"} title={dark ? "Use light theme" : "Use dark theme"} className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-ink transition hover:-translate-y-0.5 hover:border-ink hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
      {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}
