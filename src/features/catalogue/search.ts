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
