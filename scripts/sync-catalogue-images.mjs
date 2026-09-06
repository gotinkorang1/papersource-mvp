import { readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
if (!process.env.CLOUDINARY_URL) throw new Error("CLOUDINARY_URL is required");

const cloudinary = new URL(process.env.CLOUDINARY_URL);
const cloudName = cloudinary.hostname;
const apiKey = decodeURIComponent(cloudinary.username);
const apiSecret = decodeURIComponent(cloudinary.password);
const imageRoot = path.resolve("public/images");
const categoryImages = {
  "paper-printing": "close-up-view-back-school-concept.jpg",
  "writing-marking": "extreme-close-up-pen-taken-by-person-from-desk-organizer.jpg",
  "filing-organisation": "ring-binder-used-stored-documents (1).jpg",
  "office-equipment": "home-printer-based-toner.jpg",
  "school-supplies": "boy-holding-white-paper-school.jpg",
  "books-notebooks": "stack-books-with-library-scene.jpg",
  "arts-crafts": "top-view-colorful-pencils-wih-copy-space.jpg",
  "desk-accessories": "pencils-cup-white-table.jpg",
  "general-supplies": "lightbox-still-life-arrangement.jpg",
};

function signature(params) {
  const serialized = Object.entries(params).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&");
  return crypto.createHash("sha1").update(serialized + apiSecret).digest("hex");
}

async function upload(fileName, publicId) {
  const bytes = await readFile(path.join(imageRoot, fileName));
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { public_id: publicId, timestamp };
  const body = new FormData();
  body.set("file", new Blob([bytes]), fileName);
  body.set("api_key", apiKey);
  body.set("timestamp", String(timestamp));
  body.set("public_id", publicId);
  body.set("signature", signature(params));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cloudinary upload failed for ${fileName}: ${response.status} ${detail.slice(0, 240)}`);
  }
  return (await response.json()).public_id;
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 3, prepare: false });
try {
  const categories = await sql`select id, slug, name from categories where active = true and deleted_at is null and parent_id is null`;
  const products = await sql`select p.id, p.name, p.category_id, c.slug as category_slug from products p join categories c on c.id = p.category_id where p.status = 'active' and p.deleted_at is null`;
  const existing = await sql`select distinct product_id from product_images`;
  const existingIds = new Set(existing.map((row) => row.product_id));
  const uploaded = new Map();
  for (const category of categories) {
    const fileName = categoryImages[category.slug];
    if (!fileName || uploaded.has(category.slug)) continue;
    const publicId = await upload(fileName, `papersource/catalogue/${category.slug}`);
    uploaded.set(category.slug, publicId);
  }
  let assigned = 0;
  for (const product of products) {
    if (existingIds.has(product.id)) continue;
    const publicId = uploaded.get(product.category_slug) ?? uploaded.get("general-supplies");
    if (!publicId) continue;
    await sql`insert into product_images (product_id, cloudinary_public_id, alt, position) values (${product.id}, ${publicId}, ${product.name}, 0)`;
    assigned++;
  }
  console.log(`Uploaded ${uploaded.size} category images and assigned ${assigned} catalogue products.`);
} finally {
  await sql.end();
}
