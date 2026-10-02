export type ShopMenuLink = { label: string; href: string };

export type ShopMenuColumn = { title: string; links: ShopMenuLink[] };

export type CategorySummary = { name: string; slug: string };

// Keep old imported taxonomy names from creating internal links to redirecting
// category URLs. The canonical divisions are the URLs exposed in the sitemap.
const CANONICAL_CATEGORY_SLUGS: Record<string, string> = {
  paper: "paper-printing",
  writing: "writing-marking",
  "office-supplies": "office-equipment",
  "printer-supplies": "paper-printing",
  toner: "paper-printing",
  ink: "paper-printing",
  "desk-essentials": "desk-accessories",
};

function canonicalCategorySlug(slug: string) {
  return CANONICAL_CATEGORY_SLUGS[slug.toLowerCase()] ?? slug;
}

const fallbackColumns: ShopMenuColumn[] = [
  {
    title: "Paper & writing",
    links: [
      { label: "Paper", href: "/shop/paper-printing" },
      { label: "Writing", href: "/shop/writing-marking" },
      { label: "Schools", href: "/shop/school-supplies" },
      { label: "Desk", href: "/shop/desk-accessories" },
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
      const slug = typeof category?.slug === "string" ? canonicalCategorySlug(category.slug.trim()) : "";
      const name = typeof category?.name === "string" ? category.name.trim() : "";
      return Boolean(name && /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug))
        && all.findIndex((entry) => {
          const entrySlug = typeof entry?.slug === "string" ? entry.slug.trim().toLowerCase() : "";
          return canonicalCategorySlug(entrySlug) === slug.toLowerCase();
        }) === index;
    },
  );

  return uniqueCategories.map((category) => ({
    label: category.name.trim(),
    href: `/shop/${canonicalCategorySlug(category.slug.trim())}`,
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
