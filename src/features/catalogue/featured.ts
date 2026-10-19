import type { StockLevel } from "@/types/catalogue";

export type FeaturedCandidate = {
  id: string;
  /** Slug of the top-level catalogue division the product belongs to. */
  divisionSlug: string;
  hasImage: boolean;
  stock: StockLevel;
  quoteOnly?: boolean;
};

/**
 * Divisions that best represent PaperSource as a workplace supplier come first.
 * Books are a real range but should not crowd the homepage shortlist.
 */
export const FEATURED_DIVISION_PRIORITY = [
  "paper-printing",
  "writing-marking",
  "filing-organisation",
  "office-equipment",
  "desk-accessories",
  "school-supplies",
  "arts-crafts",
  "general-supplies",
  "books-notebooks",
] as const;

const stockRank: Record<StockLevel, number> = { in_stock: 0, low: 1, out: 2 };

function candidateScore(candidate: FeaturedCandidate) {
  return (
    (candidate.hasImage ? 0 : 10) +
    stockRank[candidate.stock] * 3 +
    (candidate.quoteOnly ? 1 : 0)
  );
}

function divisionRank(slug: string) {
  const index = (FEATURED_DIVISION_PRIORITY as readonly string[]).indexOf(slug);
  return index === -1 ? FEATURED_DIVISION_PRIORITY.length - 1 : index;
}

/**
 * Pick a varied homepage shortlist: one strong product per division (in
 * priority order) before any division gets a second slot. Out-of-stock
 * products are only used when nothing else is available.
 */
export function pickFeaturedIds(candidates: FeaturedCandidate[], count = 4): string[] {
  if (count <= 0 || candidates.length === 0) return [];

  const byDivision = new Map<string, FeaturedCandidate[]>();
  for (const candidate of candidates) {
    const list = byDivision.get(candidate.divisionSlug) ?? [];
    list.push(candidate);
    byDivision.set(candidate.divisionSlug, list);
  }
  for (const list of byDivision.values()) {
    list.sort((a, b) => candidateScore(a) - candidateScore(b) || a.id.localeCompare(b.id));
  }

  const divisions = [...byDivision.keys()].sort(
    (a, b) => divisionRank(a) - divisionRank(b) || a.localeCompare(b),
  );

  const picked: string[] = [];
  const pass = (allowOut: boolean) => {
    let progressed = true;
    while (picked.length < count && progressed) {
      progressed = false;
      for (const division of divisions) {
        if (picked.length >= count) break;
        const list = byDivision.get(division) ?? [];
        const nextIndex = list.findIndex(
          (candidate) => !picked.includes(candidate.id) && (allowOut || candidate.stock !== "out"),
        );
        if (nextIndex === -1) continue;
        picked.push(list[nextIndex].id);
        progressed = true;
      }
    }
  };

  pass(false);
  if (picked.length < count) pass(true);
  return picked;
}
