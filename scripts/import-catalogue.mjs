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

const CATEGORY_RULES = [
  ["Books & Notebooks", /book|notebook|story note|journal|diary|exercise/i],
  ["Paper & Printing", /paper|ream|cardstock|sticker|sticky note|thermal|toner|ink cartridge/i],
  ["Writing & Marking", /pencil|pen|marker|highlighter|crayon|chalk/i],
  ["Filing & Organisation", /folder|binder|file|envelope|document|clipboard/i],
  ["Office Equipment", /laminator|calculator|printer|shredder|projector|punch|stapler/i],
  ["School Supplies", /school|ruler|geometry|eraser|sharpener|backpack|lunch/i],
  ["Arts & Crafts", /glue|scissor|craft|paint|brush|colour|color/i],
  ["Desk Accessories", /desk|organizer|tray|calendar|tape|clip|board/i],
];

function classifyCategory(row) {
  const name = row["Item Name"]?.trim() ?? "";
  if (String(row.Category).toLowerCase() === "books") return "Books & Notebooks";
  return CATEGORY_RULES.find(([, pattern]) => pattern.test(name))?.[0] ?? "General Supplies";
}

function describeProduct(name, category, quoteOnly) {
  const cleanName = name.replace(/\s+/g, " ").trim();
  const descriptions = {
    "Books & Notebooks": `${cleanName} for organised notes, record keeping and everyday study.`,
    "Paper & Printing": `${cleanName} for clear, dependable printing and document preparation in the office, classroom or home.`,
    "Writing & Marking": `${cleanName} for smooth writing, highlighting and clear everyday marking.`,
    "Filing & Organisation": `${cleanName} for keeping documents, projects and workplace records neatly organised.`,
    "Office Equipment": `${cleanName} for efficient document handling and reliable day-to-day office work.`,
    "School Supplies": `${cleanName} to support classroom learning, homework and practical school projects.`,
    "Arts & Crafts": `${cleanName} for creative projects, classroom activities and hands-on making.`,
    "Desk Accessories": `${cleanName} for a tidier, more productive and better organised workspace.`,
    "General Supplies": `${cleanName} for dependable everyday use at work, school or home.`,
  };
  const base = descriptions[category] ?? descriptions["General Supplies"];
  const fulfilment = quoteOnly
    ? "Request a tailored quotation for bulk quantities, options and delivery."
    : "Order online for delivery across Accra and Tema, with nationwide supply available on request.";
  return `${base} ${fulfilment}`;
}

const rows = parseCsv(await readFile(path.resolve(file), "utf8"));
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 10, prepare: false });
try {
    const [brand] = await sql`insert into brands (name, slug, active) values ('Imported Catalogue', 'imported-catalogue', true) on conflict (slug) do update set active = true returning id`;
    const categoryIds = new Map();
    const categoryDefinitions = [
      ["Paper & Printing", "A4 paper, copier reams, toner and printing essentials for offices, schools and home workspaces."],
      ["Writing & Marking", "Reliable pens, pencils, markers and highlighters for clear notes, planning and everyday work."],
      ["Filing & Organisation", "Folders, binders and document storage essentials to keep workplace and school records organised."],
      ["Office Equipment", "Practical calculators, laminators and office machines that keep daily document work efficient."],
      ["School Supplies", "Classroom and study essentials selected for learners, teachers and Ghanaian schools."],
      ["Books & Notebooks", "Notebooks, journals and books for study, planning, record keeping and creative thinking."],
      ["Arts & Crafts", "Glue, colours, scissors and creative materials for classroom projects and hands-on making."],
      ["Desk Accessories", "Desk organisers and everyday accessories for a tidy, focused and productive workspace."],
      ["General Supplies", "Dependable workplace, school and home essentials available for quick order or bulk quotation."],
    ];
    for (const [category, description] of categoryDefinitions) {
      const slug = slugify(category);
      const [saved] = await sql`insert into categories (name, slug, description, active) values (${category}, ${slug}, ${description}, true) on conflict (slug) do update set name = excluded.name, description = excluded.description, active = true returning id`;
      categoryIds.set(category.toUpperCase(), saved.id);
    }
    // Retire the broad legacy buckets so empty categories do not appear in the storefront.
    await sql`update categories set active = false, updated_at = now() where slug in ('stationery', 'books', 'others')`;
    const importRow = async ([index, row]) => {
      const name = row["Item Name"]?.trim();
      if (!name) return;
      const categoryName = classifyCategory(row);
      const category = categoryIds.get(categoryName.toUpperCase());
      const slug = `catalogue-${slugify(name)}-${index + 1}`;
      const sku = `CAT-${String(index + 1).padStart(4, "0")}`;
      const cedis = Number(row["Retail Price"] || 0);
      if (!Number.isFinite(cedis) || cedis < 0) throw new Error(`Invalid retail price on row ${index + 2}`);
      const price = Math.round(cedis * 100);
      const description = describeProduct(name, categoryName, cedis === 0);
      const [product] = await sql`insert into products (name, slug, brand_id, category_id, product_type, description, status) values (${name}, ${slug}, ${brand.id}, ${category}, 'standard', ${description}, 'active') on conflict (slug) do update set name = excluded.name, category_id = excluded.category_id, description = excluded.description, status = 'active', updated_at = now() returning id`;
      const [variant] = await sql`insert into product_variants (product_id, sku, name, unit_label, base_unit_price, currency, active) values (${product.id}, ${sku}, ${name}, 'each', ${price}, 'GHS', true) on conflict (sku) do update set product_id = excluded.product_id, name = excluded.name, base_unit_price = excluded.base_unit_price, active = true returning id`;
      await sql`insert into inventory (variant_id, on_hand, reserved, low_stock_threshold) values (${variant.id}, 0, 0, 0) on conflict (variant_id) do nothing`;
      await sql`delete from price_tiers where variant_id = ${variant.id}`;
      if (price === 0) await sql`insert into price_tiers (variant_id, minimum_quantity, unit_price, request_quote, currency, active) values (${variant.id}, 1, null, true, 'GHS', true)`;
    };
    const entries = [...rows.entries()];
    for (let i = 0; i < entries.length; i += 10) await Promise.all(entries.slice(i, i + 10).map(importRow));
  console.log(`Imported ${rows.length} catalogue rows; zero-priced rows are quote-only.`);
} finally { await sql.end(); }
