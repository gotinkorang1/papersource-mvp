import { pesewasToMajor } from "@/lib/money";
import { absoluteUrl } from "@/lib/seo";
import { productSeoDescription } from "./product-metadata";

export type GoogleShoppingFeedEntry = {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink?: string;
  additionalImageLinks?: string[];
  availability: "in stock" | "out of stock";
  pricePesewas: number;
  brand: string;
  productType: string;
  gtin?: string | null;
  author?: string;
  specification?: string;
};

export function shoppingFeedTitle(input: { name: string; author?: string; specification?: string }) {
  const identity = [input.name.trim(), input.author?.trim() ? `by ${input.author.trim()}` : ""].filter(Boolean).join(" ");
  return [identity, input.specification?.trim() ?? ""].filter(Boolean).join(" — ");
}

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '\"': "&quot;" })[character] ?? character);
}

function tag(name: string, value: string | undefined | null) {
  return value ? `    <g:${name}>${escapeXml(value)}</g:${name}>` : "";
}

export function renderGoogleShoppingFeed(entries: GoogleShoppingFeedEntry[]) {
  const items = entries.map((entry) => {
    const description = productSeoDescription({ name: entry.title, brandName: entry.brand, categoryName: entry.productType, description: entry.description });

    return [
    "  <item>",
    tag("id", entry.id),
    tag("title", entry.title),
    tag("description", description),
    tag("link", entry.link),
    tag("image_link", entry.imageLink),
    ...(entry.additionalImageLinks ?? [])
      .filter((imageLink, index, links) => Boolean(imageLink) && imageLink !== entry.imageLink && links.indexOf(imageLink) === index)
      .map((imageLink) => tag("additional_image_link", imageLink)),
    tag("availability", entry.availability),
    tag("price", `${pesewasToMajor(entry.pricePesewas)} GHS`),
    tag("brand", entry.brand),
    tag("condition", "new"),
    tag("product_type", entry.productType),
    tag("gtin", entry.gtin && /^(?:\d{8}|\d{12,14})$/.test(entry.gtin) ? entry.gtin : undefined),
    tag("identifier_exists", entry.gtin && /^(?:\d{8}|\d{12,14})$/.test(entry.gtin) ? "yes" : "no"),
    "  </item>",
    ].filter(Boolean).join("\n");
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n<channel>\n  <title>PaperSource Ghana product feed</title>\n  <link>${absoluteUrl("/shop")}</link>\n  <description>Office stationery, books and workplace supplies from PaperSource Ghana.</description>\n${items}\n</channel>\n</rss>`;
}
