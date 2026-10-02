import { count, gte } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb } from "@/lib/db/client";
import { productViewEvents } from "@/lib/db/schema";

const TRENDING_WINDOW_DAYS = 30;
const MAX_FINGERPRINT_LENGTH = 128;

export type ProductOpen = {
  productId: string;
  fingerprint: string;
  occurredAt: Date;
};

export function viewEventDay(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function isViewEventEligible(
  input: { productId: string; fingerprint: string; occurredAt: Date },
  now = new Date(),
) {
  if (!input.productId.trim() || input.fingerprint.length < 8 || input.fingerprint.length > MAX_FINGERPRINT_LENGTH) return false;
  if (!Number.isFinite(input.occurredAt.getTime()) || input.occurredAt.getTime() > now.getTime()) return false;
  const age = now.getTime() - input.occurredAt.getTime();
  return age >= 0 && age < TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

export function aggregateTrending(events: ProductOpen[], now = new Date()) {
  const unique = new Set<string>();
  for (const event of events) {
    if (!isViewEventEligible(event, now)) continue;
    unique.add(`${event.productId}:${event.fingerprint}:${viewEventDay(event.occurredAt)}`);
  }

  const counts = new Map<string, number>();
  for (const key of unique) {
    const productId = key.slice(0, key.indexOf(":"));
    counts.set(productId, (counts.get(productId) ?? 0) + 1);
  }
  return counts;
}

export async function recordProductOpen(input: { productId: string; fingerprint: string; occurredAt?: Date }) {
  const occurredAt = input.occurredAt ?? new Date();
  const event = { productId: input.productId, fingerprint: input.fingerprint, occurredAt };
  if (!isViewEventEligible(event)) return false;

  const [inserted] = await getDb()
    .insert(productViewEvents)
    .values({ productId: event.productId, fingerprint: event.fingerprint, eventDay: viewEventDay(occurredAt), occurredAt })
    .onConflictDoNothing({ target: [productViewEvents.productId, productViewEvents.fingerprint, productViewEvents.eventDay] })
    .returning({ id: productViewEvents.id });
  return Boolean(inserted);
}

async function queryTrendingProductCounts(now: Date) {
  const windowStart = new Date(now.getTime() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const rows = await getDb()
    .select({ productId: productViewEvents.productId, opens: count(productViewEvents.id) })
    .from(productViewEvents)
    .where(gte(productViewEvents.occurredAt, windowStart))
    .groupBy(productViewEvents.productId);
  return new Map(rows.map((row) => [row.productId, Number(row.opens)]));
}

const loadTrendingProductCounts = unstable_cache(async function loadTrendingProductCounts() {
  return queryTrendingProductCounts(new Date());
}, ["catalogue-trending-counts"], { revalidate: 60, tags: ["catalogue-trending"] });

export async function listTrendingProductIds(productIds: string[], now?: Date) {
  const ids = [...new Set(productIds.filter(Boolean))];
  if (!ids.length) return new Map<string, number>();
  // Keep explicit timestamps deterministic for callers that need a specific
  // reporting window; storefront calls without one use the short-lived cache.
  const counts = now ? await queryTrendingProductCounts(now) : await loadTrendingProductCounts();
  return new Map(ids.flatMap((id) => {
    const opens = counts.get(id);
    return opens === undefined ? [] : [[id, opens] as const];
  }));
}
