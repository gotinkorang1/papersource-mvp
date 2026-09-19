import { readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
if (!process.env.CLOUDINARY_URL) throw new Error("CLOUDINARY_URL is required");

const root = process.cwd();
const rows = JSON.parse(await readFile(path.join(root, "data", "books.catalogue.json"), "utf8"));
const booksDir = path.join(root, "public", "books");
const STARTING_PRICE_PESEWAS = 15000;
const cloudinary = new URL(process.env.CLOUDINARY_URL);
const cloudName = cloudinary.hostname;
const apiKey = decodeURIComponent(cloudinary.username);
const apiSecret = decodeURIComponent(cloudinary.password);

function signature(params) {
  const serialized = Object.entries(params).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&");
  return crypto.createHash("sha1").update(serialized + apiSecret).digest("hex");
}

async function upload(fileName, publicId) {
  const bytes = await readFile(path.join(booksDir, fileName));
  const timestamp = Math.floor(Date.now() / 1000);
  const body = new FormData();
  body.set("file", new Blob([bytes]), fileName);
  body.set("api_key", apiKey);
  body.set("timestamp", String(timestamp));
  body.set("public_id", publicId);
  body.set("signature", signature({ public_id: publicId, timestamp }));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
  if (!response.ok) throw new Error(`Cloudinary upload failed for ${fileName}: ${response.status}`);
  return (await response.json()).public_id;
}

const fallbackDescriptions = {
  "Bodyguard: Ransom": "Teen bodyguard Connor Reeves is drawn into a dangerous kidnapping plot while protecting a young VIP.",
  Ignite: "Malia must master a dangerous power and decide how far she will go to protect the people she loves.",
  "Diary of a Wimpy Kid: Hot Mess": "Greg Heffley and his family face a chaotic road trip packed with mishaps, arguments and unexpected trouble.",
  "The Last Kids on Earth and the Zombie Parade": "Jack Sullivan and his friends battle monsters and zombies in another hilarious post-apocalyptic adventure.",
  "Myths & Legends": "A richly illustrated collection introducing young readers to memorable myths, legends and magical tales from around the world.",
  "The Boys from Biloxi": "Two sons of immigrant families grow up on opposite sides of the law in a gripping legal thriller about loyalty and revenge.",
  "Amulet: The Stonekeeper": "After moving into an old family home, Emily discovers a magical amulet and must enter a strange world to save her mother.",
  "Bone: The Great Cow Race": "Fone Bone and his cousins are swept into the excitement and danger of a great race in Jeff Smith's acclaimed graphic novel.",
  "Percy Jackson: The Throne of Fire": "Carter and Sadie Kane must awaken an ancient Egyptian god and stop a deadly enemy in this fast-paced fantasy adventure.",
  "Percy Jackson: The Serpent's Shadow": "Carter and Sadie Kane face their most powerful enemy yet in the thrilling conclusion to the Kane Chronicles.",
  "Wings of Fire: Escaping Peril": "Peril must choose between loyalty to Queen Scarlet and the friends who show her a different way to live in this dragon adventure.",
};

const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 3, prepare: false });
try {
  const [brand] = await sql`insert into brands (name, slug, active) values ('Imported Catalogue', 'imported-catalogue', true) on conflict (slug) do update set active = true returning id`;
  const [category] = await sql`select id from categories where slug = 'books-notebooks' and deleted_at is null limit 1`;
  if (!category) throw new Error("Books category books-notebooks was not found");

  for (const row of rows) {
    const description = row.description?.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1").replace(/\s+/g, " ").trim() || fallbackDescriptions[row.title];
    if (!description) throw new Error(`Missing description for ${row.title}`);
    const sku = row.isbn ? `ISBN-${row.isbn}` : `BOOK-${String(row.position).padStart(4, "0")}`;
    const frontId = await upload(row.frontFile, `papersource/books/${row.slug}/front`);
    const backId = await upload(row.backFile, `papersource/books/${row.slug}/back`);
    const [product] = await sql`
      insert into products (name, slug, brand_id, category_id, product_type, description, status)
      values (${row.title}, ${row.slug}, ${brand.id}, ${category.id}, 'standard', ${description}, 'active')
      on conflict (slug) do update set name = excluded.name, description = excluded.description, status = 'active', updated_at = now()
      returning id`;
    const [variant] = await sql`
      insert into product_variants (product_id, sku, name, unit_label, base_unit_price, currency, active)
      values (${product.id}, ${sku}, ${row.title}, 'each', ${STARTING_PRICE_PESEWAS}, 'GHS', true)
      on conflict (sku) do update set product_id = excluded.product_id, name = excluded.name, base_unit_price = ${STARTING_PRICE_PESEWAS}, active = true
      returning id`;
    await sql`insert into inventory (variant_id, on_hand, reserved, low_stock_threshold) values (${variant.id}, 10, 0, 2) on conflict (variant_id) do update set on_hand = 10, low_stock_threshold = 2`;
    for (const [position, imageId, label] of [[0, frontId, "front cover"], [1, backId, "back cover"]]) {
      const [existing] = await sql`select id from product_images where product_id = ${product.id} and position = ${position} limit 1`;
      if (existing) await sql`update product_images set cloudinary_public_id = ${imageId}, alt = ${`${row.title} ${label}`} where id = ${existing.id}`;
      else await sql`insert into product_images (product_id, variant_id, cloudinary_public_id, alt, position) values (${product.id}, ${variant.id}, ${imageId}, ${`${row.title} ${label}`}, ${position})`;
    }
    const aliases = [...new Set([row.title, row.matchedTitle, row.author, `${row.title} ${row.author}`, row.isbn].filter(Boolean))];
    for (const alias of aliases) await sql`insert into product_aliases (product_id, alias) select ${product.id}, ${alias} where not exists (select 1 from product_aliases where product_id = ${product.id} and lower(alias) = lower(${alias}))`;
    await sql`update products p set search_document = to_tsvector('simple', coalesce(p.name,'') || ' ' || coalesce(p.description,'') || ' ' || coalesce((select string_agg(a.alias,' ') from product_aliases a where a.product_id=p.id),'') || ' ' || coalesce((select string_agg(v.sku || ' ' || coalesce(v.barcode,'') ,' ') from product_variants v where v.product_id=p.id),'')) where p.id=${product.id}`;
    const attributes = [["bibliographic", "author", row.author], ["bibliographic", "isbn", row.isbn], ["bibliographic", "publisher", row.publisher], ["bibliographic", "published", row.year], ["bibliographic", "pages", row.pages]].filter(([, , value]) => value !== null && value !== undefined && value !== "");
    for (const [namespace, key, value] of attributes) await sql`insert into product_attributes (product_id, namespace, key, value_text) select ${product.id}, ${namespace}, ${key}, ${String(value)} where not exists (select 1 from product_attributes where product_id = ${product.id} and namespace = ${namespace} and key = ${key})`;
    await sql`insert into price_tiers (variant_id, minimum_quantity, maximum_quantity, unit_price, request_quote, currency, active) select ${variant.id}, 1, null, ${STARTING_PRICE_PESEWAS}, false, 'GHS', true where not exists (select 1 from price_tiers where variant_id = ${variant.id} and active = true)`;
    console.log(`${String(row.position).padStart(2, "0")} ${row.title} -> ${sku}`);
  }
  console.log(`Imported ${rows.length} books with stock 10 and two images each.`);
} finally {
  await sql.end();
}
