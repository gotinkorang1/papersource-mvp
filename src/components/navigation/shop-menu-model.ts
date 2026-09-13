export type ShopMenuLink = { label: string; href: string };

export type ShopMenuColumn = { title: string; links: ShopMenuLink[] };

type CategorySummary = { name: string; slug: string };

const fallbackColumns: ShopMenuColumn[] = [
  {
    title: "Paper & writing",
    links: [
      { label: "Paper", href: "/shop/paper" },
      { label: "Writing", href: "/shop/writing" },
      { label: "Desk", href: "/shop/desk-essentials" },
      { label: "Schools", href: "/shop/school-supplies" },
      { label: "Books & Notebooks", href: "/shop/books-notebooks" },
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

export function buildShopMenuColumns(categories: CategorySummary[]): ShopMenuColumn[] {
  const uniqueCategories = categories.filter(
    (category, index, all) => all.findIndex((entry) => entry.slug === category.slug) === index,
  );

  if (uniqueCategories.length === 0) return fallbackColumns;

  const links = uniqueCategories.map(({ name, slug }) => ({
    label: name,
    href: `/shop/${slug}`,
  }));
  const columnSize = Math.ceil(links.length / 3);
  const titles = ["Shop by category", "More categories", "More essentials"];

  return Array.from({ length: Math.ceil(links.length / columnSize) }, (_, index) => ({
    title: titles[index] ?? "Shop by category",
    links: links.slice(index * columnSize, (index + 1) * columnSize),
  }));
}
