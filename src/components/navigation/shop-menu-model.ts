export type ShopMenuLink = { label: string; href: string };

export type ShopMenuColumn = { title: string; links: ShopMenuLink[] };

export type CategorySummary = { name: string; slug: string };

const fallbackColumns: ShopMenuColumn[] = [
  {
    title: "Paper & writing",
    links: [
      { label: "Paper", href: "/shop/paper" },
      { label: "Writing", href: "/shop/writing" },
      { label: "Schools", href: "/shop/school-supplies" },
      { label: "Desk", href: "/shop/desk-essentials" },
    ],
  },
  {
    title: "Print & organise",
    links: [
      { label: "Printing", href: "/shop/printing" },
      { label: "Filing", href: "/shop/filing" },
      { label: "Technology", href: "/shop/technology" },
      { label: "Workplace", href: "/shop/workplace" },
    ],
  },
];

export function normalizeShopCategoryLinks(categories: readonly CategorySummary[]): ShopMenuLink[] {
  const uniqueCategories = categories.filter(
    (category, index, all) => {
      const slug = typeof category?.slug === "string" ? category.slug.trim() : "";
      const name = typeof category?.name === "string" ? category.name.trim() : "";
      return Boolean(name && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug))
        && all.findIndex((entry) => {
          const entrySlug = typeof entry?.slug === "string" ? entry.slug.trim().toLowerCase() : "";
          return entrySlug === slug.toLowerCase();
        }) === index;
    },
  );

  return uniqueCategories.map((category) => ({
    label: category.name.trim(),
    href: `/shop/${category.slug.trim()}`,
  }));
}

export function buildShopMenuColumns(categories: readonly CategorySummary[]): ShopMenuColumn[] {
  const links = normalizeShopCategoryLinks(categories);
  if (links.length === 0) return fallbackColumns;

  const columnSize = Math.ceil(links.length / 3);
  const titles = ["Shop by category", "More categories", "More essentials"];

  return Array.from({ length: Math.ceil(links.length / columnSize) }, (_, index) => ({
    title: titles[index] ?? "Shop by category",
    links: links.slice(index * columnSize, (index + 1) * columnSize),
  }));
}
