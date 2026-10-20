"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { History, Package } from "lucide-react";

export type RecentlyViewedItem = {
  slug: string;
  name: string;
  specLine?: string;
  imageSrc?: string;
  imageAlt?: string;
};

const STORAGE_KEY = "ps:recently-viewed";
const CHANGE_EVENT = "ps:recently-viewed-change";
const MAX_ITEMS = 8;
const EMPTY: RecentlyViewedItem[] = [];

let cachedRaw: string | null | undefined;
let cachedItems: RecentlyViewedItem[] = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): RecentlyViewedItem[] {
  if (!raw) return EMPTY;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return EMPTY;
    return value
      .filter((item): item is RecentlyViewedItem => typeof item?.slug === "string" && typeof item?.name === "string")
      .slice(0, MAX_ITEMS);
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): RecentlyViewedItem[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = parse(raw);
  }
  return cachedItems;
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function rememberRecentlyViewed(item: RecentlyViewedItem) {
  const next = [item, ...getSnapshot().filter((entry) => entry.slug !== item.slug)].slice(0, MAX_ITEMS);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing or blocked storage: the strip simply stays hidden.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/**
 * Shows products this visitor opened recently (stored only in their browser).
 * When `record` is given, that product is remembered and hidden from the strip.
 */
export function RecentlyViewed({ record, className }: { record?: RecentlyViewedItem; className?: string }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const recordKey = record ? JSON.stringify(record) : "";

  useEffect(() => {
    if (recordKey) rememberRecentlyViewed(JSON.parse(recordKey) as RecentlyViewedItem);
  }, [recordKey]);

  const visible = items.filter((item) => item.slug !== record?.slug).slice(0, 6);
  if (!visible.length) return null;

  return (
    <section aria-labelledby="recently-viewed-heading" className={className}>
      <div className="flex items-center gap-2">
        <History className="size-4 text-paper-green" aria-hidden />
        <h2 id="recently-viewed-heading" className="text-sm font-semibold uppercase tracking-[0.16em] text-slate">Recently viewed</h2>
      </div>
      <ul className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {visible.map((item) => (
          <li key={item.slug} className="w-36 shrink-0 snap-start sm:w-44">
            <Link href={`/product/${item.slug}`} className="group block rounded-xl border border-border bg-card p-2 transition hover:border-paper-green/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              <span className="relative block aspect-square overflow-hidden rounded-lg bg-muted">
                {item.imageSrc ? (
                  <Image src={item.imageSrc} alt={item.imageAlt || item.name} fill sizes="176px" className="object-contain p-1 transition-transform duration-300 motion-safe:group-hover:scale-105" />
                ) : (
                  <span className="grid size-full place-items-center text-slate/60"><Package className="size-8" aria-hidden /></span>
                )}
              </span>
              <span className="mt-2 line-clamp-2 block text-sm font-medium leading-5 text-ink">{item.name}</span>
              {item.specLine ? <span className="mt-0.5 line-clamp-1 block text-xs text-slate">{item.specLine}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
