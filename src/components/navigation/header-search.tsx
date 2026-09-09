"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function HeaderSearch({
  className,
  defaultQuery = "",
  inputId = "universal-search",
}: {
  className?: string;
  defaultQuery?: string;
  inputId?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [suggestions, setSuggestions] = useState<Array<{ slug: string; name: string; sku: string; specLine: string }>>([]);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) {
      requestRef.current?.abort();
      return;
    }
    const timer = window.setTimeout(async () => {
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      setLoading(true);
      setRequestError(false);
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(value)}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Suggestion request failed");
        const data = await response.json() as { suggestions?: typeof suggestions };
        setSuggestions(data.suggestions ?? []); setActive(-1); setOpen(true);
      } catch {
        if (!controller.signal.aborted && requestRef.current === controller) {
          setSuggestions([]);
          setActive(-1);
          setRequestError(true);
          setOpen(true);
        }
      }
      finally {
        if (requestRef.current === controller) setLoading(false);
      }
    }, 180);
    return () => {
      window.clearTimeout(timer);
      requestRef.current?.abort();
    };
  }, [query, retryNonce]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = query.trim();
    if (active >= 0 && suggestions[active]) { router.push(`/product/${suggestions[active].slug}`); setOpen(false); return; }
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("relative hidden min-w-0 flex-1 lg:block", className)}
      role="search"
    >
      <label htmlFor={inputId} className="sr-only">
        Search products
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(event) => { const next = event.target.value; setQuery(next); setRequestError(false); setOpen(next.trim().length >= 2); if (next.trim().length < 2) setSuggestions([]); }}
        onFocus={() => { if (suggestions.length) setOpen(true); }}
        onKeyDown={(event) => {
          if (!open || !suggestions.length) return;
          if (event.key === "ArrowDown") { event.preventDefault(); setActive((index) => (index + 1) % suggestions.length); }
          if (event.key === "ArrowUp") { event.preventDefault(); setActive((index) => (index - 1 + suggestions.length) % suggestions.length); }
          if (event.key === "Escape") { setOpen(false); setActive(-1); }
        }}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && query.trim().length >= 2}
        aria-busy={loading}
        aria-controls={`${inputId}-suggestions`}
        aria-activedescendant={active >= 0 ? `${inputId}-suggestion-${active}` : undefined}
        autoComplete="off"
        placeholder="Search paper, toner, pens, brands or SKU..."
        className="h-10 w-full rounded-md border border-border bg-cream px-3 text-sm text-ink transition-[background-color,border-color,box-shadow] duration-200 placeholder:text-slate focus-visible:border-ink focus-visible:bg-card focus-visible:shadow-[0_0_0_3px_rgba(16,42,67,0.08)] focus-visible:outline-none"
      />
      {open && query.trim().length >= 2 ? (
        <div id={`${inputId}-suggestions`} role="listbox" className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card p-1 shadow-xl">
          {loading ? <p role="status" className="px-3 py-3 text-sm text-slate">Searching…</p> : null}
          {!loading && requestError ? <div className="flex items-center justify-between gap-3 px-3 py-3 text-sm text-slate"><p role="status">Suggestions are temporarily unavailable.</p><button type="button" onClick={() => setRetryNonce((value) => value + 1)} className="shrink-0 font-semibold text-ink underline underline-offset-2">Retry</button></div> : null}
          {!loading && !requestError && suggestions.length === 0 ? <p role="status" className="px-3 py-3 text-sm text-slate">No matching products yet.</p> : null}
          {suggestions.map((suggestion, index) => (
            <button id={`${inputId}-suggestion-${index}`} key={suggestion.slug} type="button" role="option" aria-selected={index === active} onMouseDown={(event) => event.preventDefault()} onClick={() => { router.push(`/product/${suggestion.slug}`); setOpen(false); }} className={cn("flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left transition", index === active ? "bg-cream" : "hover:bg-cream")}>
              <span className="min-w-0"><span className="block truncate text-sm font-medium text-ink">{suggestion.name}</span><span className="block truncate text-xs text-slate">{suggestion.specLine}</span></span>
              <span className="shrink-0 text-[11px] text-slate">{suggestion.sku}</span>
            </button>
          ))}
          {!loading ? <button type="submit" className="mt-1 w-full border-t border-border/70 px-3 py-2 text-left text-xs font-semibold text-ink hover:bg-cream">View all results for “{query.trim()}”</button> : null}
        </div>
      ) : null}
    </form>
  );
}
