"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function RecentSearches({ query }: { query: string }) {
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    const existing = JSON.parse(localStorage.getItem("papersource-recent-searches") ?? "[]") as string[];
    const next = query.trim() ? [query.trim(), ...existing.filter((item) => item.toLowerCase() !== query.trim().toLowerCase())].slice(0, 5) : existing;
    if (query.trim()) localStorage.setItem("papersource-recent-searches", JSON.stringify(next));
    const timer = window.setTimeout(() => setRecent(next), 0);
    return () => window.clearTimeout(timer);
  }, [query]);
  if (!recent.length) return null;
  return <div className="mt-5"><p className="text-xs font-semibold tracking-[0.14em] text-slate uppercase">Recent searches</p><div className="mt-2 flex flex-wrap gap-2">{recent.map((item) => <Link key={item} href={`/search?q=${encodeURIComponent(item)}`} className="rounded-full border border-border px-3 py-1.5 text-sm text-slate transition hover:border-ink hover:text-ink">{item}</Link>)}</div></div>;
}
