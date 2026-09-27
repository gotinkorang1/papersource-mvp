import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 3, prepare: false });

const brandRules = [
  ["DELI", /\bdeli\b/i],
  ["HUAJIE", /\bhuajie\b/i],
  ["HUHUA", /\bhuhua\b/i],
  ["Kangaro", /\bkangaro\b/i],
  ["CASIO", /\bcasio\b/i],
  ["Monami", /\bmonami\b/i],
  ["NUSIGN", /\bnusign\b/i],
  ["Nataraj", /\bnataraj\b/i],
  ["Oxford", /\boxford\b/i],
  ["Pébéo", /\bpebeo\b|\bpebe?o\b/i],
  ["FENLOT", /\bfenlot\b/i],
  ["LANPAIER", /\blanpaier\b/i],
  ["NIWAY", /\bniway\b/i],
  ["Sina Spectra", /\bsina\s+spectra\b/i],
  ["Rexel", /\brexel\b/i],
  ["Yatai", /\byatai\b/i],
  ["Yosee", /\byosee\b/i],
  ["Zibom", /\bzibom\b/i],
  ["Caboshi", /\bcaboshi\b/i],
  ["Mashall", /\bmashall\b/i],
  ["Aim Aisi", /\baim\s+aisi\b/i],
];

const categoryRules = [
  ["books-notebooks", /book|novel|notebook|note\s*book|story\s*note|journal|diary|sketchbook|sketch\s*book|dictionary|fiction|classics|myths|legend|poem|poetry|reader|olympian|hunger games|harry potter|wimpy kid|kids? on earth/i],
  ["paper-printing", /paper|ream|cardboard|cardstock|laminating|binding pvc|pvc cover|loose-leaf|official sheet|photo paper|sticker|thermal|ink|toner/i],
  ["writing-marking", /pencil|pen|marker|highlighter|crayon|chalk|correction|eraser|sharpener/i],
  ["filing-organisation", /folder|binder|file|envelope|document tray|clip|index tab|ring|archive|staple pin/i],
  ["office-equipment", /calculator|laminator|printer|shredder|perforator|stapler|mathset|stamp|cut(ter|ting)|power bank/i],
  ["school-supplies", /ruler|school|student|geometry|backpack|lunch|pencil case|pencil bag/i],
  ["arts-crafts", /glue|scissor|craft|paint|brush|colour|color|artist|canvas|frame/i],
  ["desk-accessories", /desk|organizer|tray|calendar|tape|cellotape|push pin|key ring|sticky|memo|price tag/i],
];

function slugify(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function displayName(value) {
  return value.replace(/\s+/g, " ").replace(/\s+([,.)])/g, "$1").trim();
}

function categoryFor(name, currentSlug) {
  const clean = displayName(name);
  if (/invoice book|receipt book|official book|order book/i.test(clean)) return "paper-printing";
  return categoryRules.find(([, pattern]) => pattern.test(clean))?.[0] ?? currentSlug ?? "general-supplies";
}

function brandFor(name) {
  return brandRules.find(([, pattern]) => pattern.test(name))?.[0] ?? "Unbranded";
}

function descriptionFor(name, categorySlug) {
  const title = displayName(name);
  if (categorySlug === "books-notebooks") {
    if (/notebook|note\s*book|diary|journal|sketchbook|sketch\s*book/i.test(title)) {
      return `${title} is a practical notebook for school, office planning, journalling and everyday notes. Available for retail purchase and school or business orders.`;
    }
    return `${title} is a reading title for personal libraries, school reading and thoughtful gifting. Ask us about availability for school or bulk orders.`;
  }
  const copy = {
    "paper-printing": `${title} supports printing, copying, binding and dependable document preparation at work, school or home.`,
    "writing-marking": `${title} is a dependable writing, drawing, correction or marking essential for school, office and everyday use.`,
    "filing-organisation": `${title} helps keep documents, projects and records sorted, protected and easy to retrieve.`,
    "office-equipment": `${title} supports efficient day-to-day office, classroom and document-handling tasks.`,
    "school-supplies": `${title} supports classroom learning, homework, study and practical school projects.`,
    "arts-crafts": `${title} is suitable for creative projects, classroom activities, art practice and hands-on making.`,
    "desk-accessories": `${title} helps create a tidier, more organised and productive workspace.`,
    "general-supplies": `${title} is a versatile everyday essential for work, school or home use.`,
  };
  return copy[categorySlug] ?? copy["general-supplies"];
}

try {
  const result = await sql.begin(async (tx) => {
    const [categories, brands, products] = await Promise.all([
      tx`select id, name, slug from categories where deleted_at is null`,
      tx`select id, name, slug from brands where deleted_at is null`,
      tx`select p.id, p.name, p.description, c.slug as category_slug from products p left join categories c on c.id = p.category_id where p.deleted_at is null and p.status = 'draft'`,
    ]);

    const categoryBySlug = new Map(categories.map((row) => [row.slug, row]));
    const brandByName = new Map(brands.map((row) => [row.name.toLowerCase(), row]));
    const unbranded = brandByName.get("unbranded") ?? (await tx`
      insert into brands (name, slug, active) values ('Unbranded', 'unbranded', true)
      on conflict (slug) do update set active = true
      returning id, name, slug
    `)[0];
    brandByName.set("unbranded", unbranded);

    const categoryUpdates = new Map();
    const brandUpdates = new Map();
    for (const product of products) {
      const categorySlug = categoryFor(product.name, product.category_slug);
      const category = categoryBySlug.get(categorySlug) ?? categoryBySlug.get("general-supplies");
      if (!category) throw new Error(`Missing target category for ${product.name}`);
      const brandName = brandFor(product.name);
      let brand = brandByName.get(brandName.toLowerCase());
      if (!brand) {
        brand = (await tx`
          insert into brands (name, slug, active) values (${brandName}, ${slugify(brandName)}, true)
          on conflict (slug) do update set active = true
          returning id, name, slug
        `)[0];
        brandByName.set(brandName.toLowerCase(), brand);
      }
      await tx`update products set category_id = ${category.id}, brand_id = ${brand.id}, description = ${descriptionFor(product.name, category.slug)}, updated_at = now() where id = ${product.id}`;
      categoryUpdates.set(category.name, (categoryUpdates.get(category.name) ?? 0) + 1);
      brandUpdates.set(brand.name, (brandUpdates.get(brand.name) ?? 0) + 1);
    }

    const [renamed] = await tx`update categories set name = 'Books & Notebooks', updated_at = now() where slug = 'books-notebooks' and name = 'Books' returning id`;
    return { products: products.length, categoryUpdates: Object.fromEntries(categoryUpdates), brandUpdates: Object.fromEntries(brandUpdates), renamed: Boolean(renamed) };
  });
  console.log(JSON.stringify(result, null, 2));
} finally {
  await sql.end();
}
