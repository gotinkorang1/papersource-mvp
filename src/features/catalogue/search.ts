export function buildSpecLine(
  attributes: { key: string; valueText: string }[],
): string {
  const preferred = [
    "size",
    "gsm",
    "sheets",
    "colour",
    "ink_colour",
    "tip_size",
    "type",
    "oem",
    "yield",
    "compatible_models",
    "material",
    "capacity",
    "pack_quantity",
  ];
  const byKey = new Map(
    attributes.map((attribute) => [attribute.key, attribute.valueText]),
  );
  const parts = preferred
    .map((key) => byKey.get(key))
    .filter((value): value is string => Boolean(value));

  return parts.join(" • ");
}

/** Book-only secondary metadata; other catalogue items should not invent a title fallback. */
export function buildSupplementalSpecLine(
  attributes: { namespace: string; key: string; valueText: string }[],
): string {
  const byKey = new Map(
    attributes
      .filter((attribute) => attribute.namespace === "book")
      .map((attribute) => [attribute.key, attribute.valueText]),
  );
  const author = byKey.get("author");
  if (!author) return "";
  return [`By ${author}`, byKey.get("format")].filter(Boolean).join(" • ");
}

export function matchesCatalogueQuery(
  haystacks: string[],
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();

  if (!needle) {
    return true;
  }

  return haystacks.some((value) => value.toLowerCase().includes(needle));
}

export function uniqueCatalogueProducts<
  T extends { product: { id: string } },
>(rows: T[]): T[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (seen.has(row.product.id)) return false;
    seen.add(row.product.id);
    return true;
  });
}
