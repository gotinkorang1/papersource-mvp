export type BrandDirectoryItem = {
  id: string;
  name: string;
  slug: string;
  categories: { name: string; slug: string }[];
};

export type BrandDirectoryFilters = {
  query: string;
  category: string;
  sort: "name";
};

export function filterAndSortBrands(
  brands: BrandDirectoryItem[],
  filters: BrandDirectoryFilters,
): BrandDirectoryItem[] {
  const merged = new Map<string, BrandDirectoryItem>();
  for (const brand of brands) {
    const key = brand.name.trim().toLocaleLowerCase();
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, {
        ...brand,
        name: brand.name.trim(),
        categories: [...brand.categories],
      });
      continue;
    }

    const categories = new Map(existing.categories.map((category) => [category.slug, category]));
    for (const category of brand.categories) categories.set(category.slug, category);
    existing.categories = [...categories.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  const unique = [...merged.values()];
  const query = filters.query.trim().toLocaleLowerCase();
  return unique
    .filter((brand) => !query || brand.name.toLocaleLowerCase().includes(query))
    .filter((brand) => !filters.category || brand.categories.some((category) => category.slug === filters.category))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}
