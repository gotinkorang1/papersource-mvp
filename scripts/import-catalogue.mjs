import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

const file = process.argv[2];
if (!file) throw new Error("Usage: node scripts/import-catalogue.mjs <csv-file>");
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i], next = text[i + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; i++; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === "," && !quoted) { row.push(cell.trim()); cell = ""; continue; }
    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i++;
      row.push(cell.trim()); cell = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
      continue;
    }
    cell += char;
  }
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
  const [header, ...data] = rows;
  return data.map((values) => Object.fromEntries(header.map((key, i) => [key, values[i] ?? ""])));
}

function slugify(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

const rows = parseCsv(await readFile(path.resolve(file), "utf8"));
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 10, prepare: false });
try {
    const [brand] = await sql`insert into brands (name, slug, active) values ('Imported Catalogue', 'imported-catalogue', true) on conflict (slug) do update set active = true returning id`;
    const categoryIds = new Map();
    for (const category of ["Stationery", "Books", "Others"]) {
      const slug = slugify(category);
      const [saved] = await sql`insert into categories (name, slug, active) values (${category}, ${slug}, true) on conflict (slug) do update set name = excluded.name, active = true returning id`;
      categoryIds.set(category.toUpperCase(), saved.id);
    }
    const importRow = async ([index, row]) => {
      const name = row["Item Name"]?.trim();
      if (!name) return;
      const category = categoryIds.get((row.Category || "OTHERS").toUpperCase()) ?? categoryIds.get("OTHERS");
      const slug = `catalogue-${slugify(name)}-${index + 1}`;
      const sku = `CAT-${String(index + 1).padStart(4, "0")}`;
      const cedis = Number(row["Retail Price"] || 0);
      if (!Number.isFinite(cedis) || cedis < 0) throw new Error(`Invalid retail price on row ${index + 2}`);
      const price = Math.round(cedis * 100);
      const [product] = await sql`insert into products (name, slug, brand_id, category_id, product_type, status) values (${name}, ${slug}, ${brand.id}, ${category}, 'standard', 'active') on conflict (slug) do update set name = excluded.name, category_id = excluded.category_id, status = 'active', updated_at = now() returning id`;
      const [variant] = await sql`insert into product_variants (product_id, sku, name, unit_label, base_unit_price, currency, active) values (${product.id}, ${sku}, ${name}, 'each', ${price}, 'GHS', true) on conflict (sku) do update set product_id = excluded.product_id, name = excluded.name, base_unit_price = excluded.base_unit_price, active = true returning id`;
      await sql`insert into inventory (variant_id, on_hand, reserved, low_stock_threshold) values (${variant.id}, 0, 0, 0) on conflict (variant_id) do nothing`;
      await sql`delete from price_tiers where variant_id = ${variant.id}`;
      if (price === 0) await sql`insert into price_tiers (variant_id, minimum_quantity, unit_price, request_quote, currency, active) values (${variant.id}, 1, null, true, 'GHS', true)`;
    };
    const entries = [...rows.entries()];
    for (let i = 0; i < entries.length; i += 10) await Promise.all(entries.slice(i, i + 10).map(importRow));
  console.log(`Imported ${rows.length} catalogue rows; zero-priced rows are quote-only.`);
} finally { await sql.end(); }
