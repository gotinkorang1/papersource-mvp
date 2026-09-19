import { readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
if (!process.env.CLOUDINARY_URL) throw new Error("CLOUDINARY_URL is required");

const root = process.cwd();
const productsDir = path.join(root, "public", "books", "new2");
const money = (cedis) => cedis * 100;
const rows = [
  { name: "HUAJIE H-0209 Stainless Steel Scissors", brand: "HUAJIE", category: "stationery", price: 17, sku: "HUAJIE-H0209", front: "WhatsApp Image 2026-09-17 at 6.59.16 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 6.59.25 AM.jpeg", description: "HUAJIE H-0209 stainless steel scissors with sharp blades, smooth cutting performance and comfortable black handles for everyday school, office and craft use.", aliases: ["H-0209", "stainless steel scissors", "office scissors"] },
  { name: "NUSIGN NS729 2B Pencils — 10 Pack", brand: "NUSIGN", category: "writing-marking", price: 36, sku: "NUSIGN-NS729-2B-10", front: "WhatsApp Image 2026-09-17 at 7.00.02 AM.jpeg", back: null, description: "NUSIGN NS729 2B writing pencils in a 10-piece pack, designed for smooth everyday writing, schoolwork, drawing and note-taking.", aliases: ["NS729", "NS729 2B", "2B pencils", "10 pencils"] },
  { name: "Deli E2041 18mm Auto-Lock Utility Cutter", brand: "DELI", category: "stationery", price: 25, sku: "DELI-E2041", front: "WhatsApp Image 2026-09-17 at 7.00.32 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.01.14 AM.jpeg", description: "Deli E2041 utility cutter with an 18mm SK5 steel blade, auto-lock slider and durable yellow body for cutting paper, card, packaging and office materials.", aliases: ["E2041", "2041", "18mm cutter", "utility knife"] },
  { name: "NUSIGN NS729 HB Pencils — 10 Pack", brand: "NUSIGN", category: "writing-marking", price: 38, sku: "NUSIGN-NS729-HB-10", front: "WhatsApp Image 2026-09-17 at 7.01.36 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.01.44 AM.jpeg", description: "NUSIGN NS729 HB writing pencils in a 10-piece pack with smooth graphite for school notes, office writing, sketching and everyday use.", aliases: ["NS729 HB", "HB pencils", "black wooden pencils", "10 pencils"] },
  { name: "Nataraj Construct Mathematical Instruments Set", brand: "Nataraj", category: "school-supplies", price: 40, sku: "NATARAJ-CONSTRUCT-SET", front: "WhatsApp Image 2026-09-17 at 7.02.00 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.02.03 AM.jpeg", description: "Nataraj Construct mathematical instruments set with compass, divider, protractor, set squares, 15cm scale, eraser and sharpener for accurate school geometry work.", aliases: ["Construct geometry set", "mathematical instruments", "geometry box", "math set"] },
  { name: "Deli No. 6793 Desk Pen Stand — Black 0.5mm", brand: "DELI", category: "writing-marking", price: 210, sku: "DELI-6793-BLACK-05", front: "WhatsApp Image 2026-09-17 at 7.02.22 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.02.29 AM.jpeg", description: "Deli No. 6793 black 0.5mm desk pen with a comfortable angled barrel and stable desk stand, suitable for reception desks, offices, classrooms and everyday writing.", aliases: ["6793", "0.5mm desk pen", "black desk pen", "Deli desk pen"] },
  { name: "Zibom P-8005 2B Pencils — 12 Pack", brand: "Zibom", category: "writing-marking", price: 20, sku: "ZIBOM-P8005-2B-12", front: "WhatsApp Image 2026-09-17 at 7.02.43 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.02.48 AM.jpeg", description: "Zibom P-8005 2B pencils in a 12-piece pack with smooth graphite for school writing, drawing, practice exercises and everyday stationery needs.", aliases: ["P-8005", "P8005", "2B pencil pack", "12 pencils"] },
  { name: "CASIO fx-991ES PLUS 2nd Edition Scientific Calculator", brand: "CASIO", category: "office-equipment", price: 200, sku: "CASIO-FX991ESPLUS-2", front: "WhatsApp Image 2026-09-17 at 7.02.59 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.03.03 AM.jpeg", description: "CASIO fx-991ES PLUS 2nd edition scientific calculator with a natural textbook display, 417 functions, solar and battery power, and advanced tools for school, university and technical calculations.", aliases: ["fx-991ES PLUS", "fx991ES", "scientific calculator", "417 functions", "4549526608902"] },
  { name: "HUAJIE H-0208 Stainless Steel Scissors", brand: "HUAJIE", category: "stationery", price: 12, sku: "HUAJIE-H0208", front: "WhatsApp Image 2026-09-17 at 7.03.51 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.03.56 AM.jpeg", description: "HUAJIE H-0208 stainless steel scissors with sharp blades, balanced handles and smooth cutting action for school, office, home and craft tasks.", aliases: ["H-0208", "stainless scissors", "craft scissors"] },
  { name: "Plush Dog Keychain", brand: "Unbranded", category: "others", price: 30, sku: "KEYCHAIN-PLUSH-DOG-01", front: "WhatsApp Image 2026-09-17 at 7.04.35 AM.jpeg", back: null, description: "Cute plush dog keychain with a soft stuffed character, hanging loop and metal key ring for bags, keys, pencil cases and small gifts.", aliases: ["dog keychain", "plush keyring", "stuffed animal keychain"] },
  { name: "Solar Desktop Calculator — 12 Digit", brand: "Unbranded", category: "office-equipment", price: 65, sku: "CALCULATOR-SOLAR-12D-01", front: "WhatsApp Image 2026-09-17 at 7.05.01 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.05.05 AM.jpeg", description: "Large 12-digit solar desktop calculator with memory, percentage, square-root and business calculation keys, plus two-way power for office, school and home use.", aliases: ["12 digit calculator", "solar calculator", "desktop calculator", "basic calculator"] },
  { name: "SASA S-20W Hot Melt Glue Gun", brand: "SASA", category: "arts-crafts", price: 80, sku: "SASA-S20W-GLUE-GUN", front: "WhatsApp Image 2026-09-17 at 7.05.16 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.05.20 AM.jpeg", description: "SASA S-20W hot melt glue gun for crafts, repairs, school projects and light-duty assembly, with a trigger grip, on/off switch and 100–240V input.", aliases: ["S-20W", "20W glue gun", "hot glue gun", "craft glue gun"] },
  { name: "MS-186 7-Piece Compass Set", brand: "Unbranded", category: "school-supplies", price: 30, sku: "MS-186-COMPASS-SET", front: "WhatsApp Image 2026-09-17 at 7.05.30 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.05.35 AM.jpeg", description: "MS-186 seven-piece compass set with a compass, ruler and geometry accessories in a protective case for school mathematics, technical drawing and classroom work.", aliases: ["MS-186", "7 piece compass set", "compass box", "geometry compass"] },
  { name: "HUAJIE WR6013 Colour Pencils — 12 Colours", brand: "HUAJIE", category: "arts-crafts", price: 10, sku: "HUAJIE-WR6013-12", front: "WhatsApp Image 2026-09-17 at 7.05.50 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.06.01 AM.jpeg", description: "HUAJIE WR6013 12-colour pencil set for colouring, school art projects, creative lettering and everyday drawing practice.", aliases: ["WR6013", "12 colour pencils", "colouring pencils", "colored pencils"] },
  { name: "Deli No. 0595 Metal Pencil Sharpener", brand: "DELI", category: "writing-marking", price: 15, sku: "DELI-0595", front: "WhatsApp Image 2026-09-17 at 7.06.12 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.06.57 AM.jpeg", description: "Deli No. 0595 metal pencil sharpener with a durable alloy body and steel blade for clean, controlled sharpening at school, home or the office.", aliases: ["0595", "metal sharpener", "pencil sharpener", "Deli sharpener"] },
  { name: "Nice Day Model 7311 Pencil Case", brand: "Nice Day", category: "school-supplies", price: 30, sku: "NICE-DAY-7311", front: "WhatsApp Image 2026-09-17 at 7.07.04 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.07.14 AM.jpeg", description: "Nice Day model 7311 purple pencil case with a zip closure and compact storage for pens, pencils, erasers and everyday school supplies.", aliases: ["7311", "purple pencil case", "pencil pouch", "stationery pouch"] },
  { name: "Deli Yellow Utility Cutter", brand: "DELI", category: "stationery", price: 20, sku: "DELI-CUTTER-YELLOW-01", front: "WhatsApp Image 2026-09-17 at 7.07.19 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.07.23 AM.jpeg", description: "Deli yellow utility cutter with a retractable steel blade and ergonomic body for opening packages, trimming card and everyday office cutting tasks.", aliases: ["yellow cutter", "Deli utility knife", "retractable cutter"] },
  { name: "KKL Drawing Set", brand: "KKL", category: "school-supplies", price: 100, sku: "KKL-DRAWING-SET-01", front: "WhatsApp Image 2026-09-17 at 7.07.50 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.07.56 AM.jpeg", description: "KKL drawing set with essential rulers and measuring tools for technical drawing, classroom geometry, design practice and school projects.", aliases: ["drawing instruments", "technical drawing set", "geometry rulers"] },
  { name: "Basketball Pencil Case", brand: "Unbranded", category: "school-supplies", price: 37, sku: "PENCIL-CASE-BASKETBALL-01", front: "WhatsApp Image 2026-09-17 at 7.08.13 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.08.22 AM.jpeg", description: "Basketball-themed pencil case with a zip compartment for organising pens, pencils, markers, erasers and other school stationery.", aliases: ["basketball pencil case", "sports pencil pouch", "school pencil case"] },
  { name: "Deli No. 0359 Stapler Set", brand: "DELI", category: "desk-accessories", price: 100, sku: "DELI-0359-STAPLER-SET", front: "WhatsApp Image 2026-09-17 at 7.08.50 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.08.55 AM.jpeg", description: "Deli No. 0359 office stapler set with a stapler, staple remover, 640 staples and a 60-sheet stapling depth for organised desk work.", aliases: ["0359", "stapler set", "office stapler", "640 staples"] },
  { name: "COKAI CK5021 30cm Geometric Ruler Set", brand: "COKAI", category: "school-supplies", price: 12, sku: "COKAI-CK5021", front: "WhatsApp Image 2026-09-17 at 7.09.15 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.09.19 AM.jpeg", description: "COKAI CK5021 30cm geometric ruler set with a ruler, set squares and protractor for measuring, geometry, technical drawing and classroom work.", aliases: ["CK5021", "30cm ruler set", "geometric ruler set", "geometry tools"] },
  { name: "Deli X60 Manual Pencil Sharpener", brand: "DELI", category: "writing-marking", price: 50, sku: "DELI-X60", front: "WhatsApp Image 2026-09-17 at 7.09.40 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.09.51 AM.jpeg", description: "Deli X60 manual pencil sharpener with a covered blue body, hand crank and multi-angle sharpening design for clean classroom and home use.", aliases: ["X60", "manual sharpener", "hand crank sharpener", "Deli X60"] },
  { name: "My Bestie 58-Piece Art Set", brand: "Unbranded", category: "arts-crafts", price: 60, sku: "MY-BESTIE-ART-SET-58", front: "WhatsApp Image 2026-09-17 at 7.10.12 AM.jpeg", back: "WhatsApp Image 2026-09-17 at 7.10.17 AM.jpeg", description: "My Bestie 58-piece art set in a pink carry case with colouring and drawing supplies for creative play, school projects and beginner artists.", aliases: ["58 piece art set", "kids art set", "children's colouring set", "drawing kit"] },
];

const cloudinary = new URL(process.env.CLOUDINARY_URL);
const cloudName = cloudinary.hostname;
const apiKey = decodeURIComponent(cloudinary.username);
const apiSecret = decodeURIComponent(cloudinary.password);
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 3, prepare: false });
const slugify = (value) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function signature(params) {
  const serialized = Object.entries(params).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&");
  return crypto.createHash("sha1").update(serialized + apiSecret).digest("hex");
}

async function upload(fileName, publicId) {
  if (!fileName) return null;
  const bytes = await readFile(path.join(productsDir, fileName));
  const timestamp = Math.floor(Date.now() / 1000);
  const body = new FormData();
  body.set("file", new Blob([bytes]), fileName);
  body.set("api_key", apiKey);
  body.set("timestamp", String(timestamp));
  body.set("public_id", publicId);
  body.set("signature", signature({ public_id: publicId, timestamp }));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
  if (!response.ok) throw new Error(`Cloudinary upload failed for ${fileName}: ${response.status} ${(await response.text()).slice(0, 300)}`);
  return (await response.json()).public_id;
}

const byName = new Map();
const bySku = new Map();
const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "");

try {
  const categories = Object.fromEntries((await sql`select id,slug from categories where deleted_at is null`).map((row) => [row.slug, row.id]));
  const brands = Object.fromEntries((await sql`select id,slug from brands where deleted_at is null`).map((row) => [row.slug, row.id]));
  const existingProducts = await sql`select id,name,slug from products where deleted_at is null`;
  for (const product of existingProducts) byName.set(normalize(product.name), product);
  const existingVariants = await sql`select id,product_id,sku from product_variants`;
  for (const variant of existingVariants) bySku.set(normalize(variant.sku), variant);

  for (const row of rows) {
    const slug = `product-${slugify(row.name)}`;
    const brandSlug = slugify(row.brand);
    const brandId = brands[brandSlug] ?? (await sql`insert into brands (name,slug,active) values (${row.brand},${brandSlug},true) on conflict (slug) do update set name=excluded.name,active=true,deleted_at=null,updated_at=now() returning id`)[0].id;
    const categoryId = categories[row.category] ?? categories.stationery;
    if (!categoryId) throw new Error(`Category not found for ${row.name}: ${row.category}`);
    const frontId = await upload(row.front, `papersource/products/${slug}/front`);
    const backId = await upload(row.back, `papersource/products/${slug}/back`);
    let product = byName.get(normalize(row.name));
    if (!product) {
      product = (await sql`insert into products (name,slug,brand_id,category_id,product_type,description,status) values (${row.name},${slug},${brandId},${categoryId},'standard',${row.description},'active') on conflict (slug) do update set name=excluded.name,brand_id=excluded.brand_id,category_id=excluded.category_id,description=excluded.description,status='active',deleted_at=null,updated_at=now() returning id,slug`)[0];
      byName.set(normalize(row.name), product);
    } else {
      product = (await sql`update products set name=${row.name},brand_id=${brandId},category_id=${categoryId},product_type='standard',description=${row.description},status='active',deleted_at=null,updated_at=now() where id=${product.id} returning id,slug`)[0];
    }
    let variant = bySku.get(normalize(row.sku));
    if (!variant) {
      variant = (await sql`insert into product_variants (product_id,sku,name,unit_label,base_unit_price,currency,active) values (${product.id},${row.sku},${row.name},'each',${money(row.price)},'GHS',true) on conflict (sku) do update set product_id=excluded.product_id,name=excluded.name,base_unit_price=excluded.base_unit_price,active=true returning id,product_id,sku`)[0];
      bySku.set(normalize(row.sku), variant);
    } else {
      variant = (await sql`update product_variants set product_id=${product.id},name=${row.name},base_unit_price=${money(row.price)},currency='GHS',active=true where id=${variant.id} returning id,product_id,sku`)[0];
    }
    await sql`insert into inventory (variant_id,on_hand,reserved,low_stock_threshold) values (${variant.id},10,0,2) on conflict (variant_id) do update set on_hand=10,low_stock_threshold=2`;
    const images = [[0, frontId, `${row.name} front view`], [1, backId, `${row.name} back view`]].filter(([, publicId]) => publicId);
    for (const [position, publicId, alt] of images) {
      const existingImage = (await sql`select id from product_images where product_id=${product.id} and position=${position} limit 1`)[0];
      if (existingImage) await sql`update product_images set variant_id=${variant.id},cloudinary_public_id=${publicId},alt=${alt} where id=${existingImage.id}`;
      else await sql`insert into product_images (product_id,variant_id,cloudinary_public_id,alt,position) values (${product.id},${variant.id},${publicId},${alt},${position})`;
    }
    for (const alias of [...new Set([row.name, row.sku, ...row.aliases])]) await sql`insert into product_aliases (product_id,alias) select ${product.id},${alias} where not exists (select 1 from product_aliases where product_id=${product.id} and lower(alias)=lower(${alias}))`;
    const attributes = [["brand", row.brand], ["sku_model", row.sku], ["price_source", "orange cover label"]];
    for (const [key, value] of attributes) await sql`insert into product_attributes (product_id,namespace,key,value_text) values (${product.id},'catalogue',${key},${value}) on conflict do nothing`;
    await sql`update products p set search_document=to_tsvector('simple',coalesce(p.name,'')||' '||coalesce(p.description,'')||' '||coalesce((select string_agg(a.alias,' ') from product_aliases a where a.product_id=p.id),'')||' '||coalesce((select string_agg(v.sku||' '||coalesce(v.barcode,''),' ') from product_variants v where v.product_id=p.id),'')) where p.id=${product.id}`;
    await sql`update price_tiers set active=false where variant_id=${variant.id} and active=true`;
    await sql`insert into price_tiers (variant_id,minimum_quantity,maximum_quantity,unit_price,request_quote,currency,active) values (${variant.id},1,null,${money(row.price)},false,'GHS',true)`;
    console.log(`${row.name} -> GHS ${row.price} | ${row.brand} | ${row.category} | ${images.length} image(s)`);
  }
  console.log(`Imported or updated ${rows.length} products; existing products were updated instead of duplicated.`);
} finally {
  await sql.end();
}
