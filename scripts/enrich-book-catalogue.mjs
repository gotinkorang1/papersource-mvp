import { readFile, writeFile } from "node:fs/promises";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const dataPath = "data/books.catalogue.json";
const rows = JSON.parse(await readFile(dataPath, "utf8"));
const genreByTitle = {
  Stranded: "Survival adventure",
  "The BFG": "Fantasy",
  "Detective Stories": "Mystery",
  Weedflower: "Historical fiction",
  "Artemis Fowl: The Arctic Incident": "Fantasy adventure",
  "Little House in the Big Woods": "Historical fiction",
  Stowaway: "Historical adventure",
  "The Savage Fortress": "Fantasy adventure",
  Stormbreaker: "Spy thriller",
  "Maniac Magee": "Contemporary fiction",
  "Kira-Kira": "Historical fiction",
  "There's a Boy in the Girls' Bathroom": "School story",
  "The Bad Beginning": "Dark comedy",
  "Diary of a Wimpy Kid: Party Pooper": "Humor",
  "Bodyguard: Ransom": "Spy thriller",
  "Heart of a Samurai": "Historical adventure",
  Ignite: "Romantic fantasy",
  "Picture Perfect": "Contemporary fiction",
  "Diary of a Wimpy Kid: Hot Mess": "Humor",
  "The Last Kids on Earth and the Zombie Parade": "Post-apocalyptic adventure",
  "Sword Song": "Historical fiction",
  "It Ends with Us": "Contemporary romance",
  "The Da Vinci Code": "Mystery thriller",
  Becoming: "Memoir",
  Origin: "Mystery thriller",
  "Myths & Legends": "Myths and folklore",
  "Magical Stories": "Fantasy stories",
  "Harry Potter and the Half-Blood Prince": "Fantasy",
  "The Boys from Biloxi": "Legal thriller",
  "Space Dumplins": "Science-fiction graphic novel",
  "Alex Rider: Eagle Strike": "Spy thriller",
  "Vanishing Acts": "Contemporary fiction",
  "Precious Gifts": "Family drama",
  "Amulet: The Stonekeeper": "Fantasy graphic novel",
  "A Tale of Magic...": "Fantasy",
  "Goosebumps: Creepy Creatures": "Horror graphic novel",
  "Bone: The Great Cow Race": "Fantasy graphic novel",
  "Percy Jackson: The Throne of Fire": "Mythological fantasy",
  "Percy Jackson: The Serpent's Shadow": "Mythological fantasy",
  "The Haunting of Gabriel Ashe": "Supernatural mystery",
  "Wings of Fire: Escaping Peril": "Fantasy adventure",
};
const seriesByTitle = {
  "Artemis Fowl: The Arctic Incident": "Artemis Fowl",
  "The Bad Beginning": "A Series of Unfortunate Events",
  "Diary of a Wimpy Kid: Party Pooper": "Diary of a Wimpy Kid",
  "Diary of a Wimpy Kid: Hot Mess": "Diary of a Wimpy Kid",
  "The Last Kids on Earth and the Zombie Parade": "The Last Kids on Earth",
  "Harry Potter and the Half-Blood Prince": "Harry Potter",
  "Alex Rider: Eagle Strike": "Alex Rider",
  "Amulet: The Stonekeeper": "Amulet",
  "Goosebumps: Creepy Creatures": "Goosebumps",
  "Bone: The Great Cow Race": "Bone",
  "Percy Jackson: The Throne of Fire": "The Kane Chronicles",
  "Percy Jackson: The Serpent's Shadow": "The Kane Chronicles",
  "Wings of Fire: Escaping Peril": "Wings of Fire",
};
const formatByTitle = {
  "Space Dumplins": "Graphic novel",
  "Amulet: The Stonekeeper": "Graphic novel",
  "Goosebumps: Creepy Creatures": "Graphic novel",
  "Bone: The Great Cow Race": "Graphic novel",
  "Detective Stories": "Story collection",
  "Myths & Legends": "Illustrated reference",
  "Magical Stories": "Story collection",
  Becoming: "Memoir",
};

const clean = (value) => value.replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
const compact = (value) => clean(value).replace(/[“”"'.,:;!?&]/g, "").replace(/\s+/g, " ").trim();
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 3, prepare: false });

try {
  for (const row of rows) {
    const [product] = await sql`select id from products where slug = ${row.slug} and deleted_at is null limit 1`;
    if (!product) throw new Error(`Product not found: ${row.title}`);
    const [variant] = await sql`select id, sku from product_variants where product_id = ${product.id} and active = true limit 1`;
    if (!variant) throw new Error(`Variant not found: ${row.title}`);

    const seoTitle = `${row.title} by ${row.author} | Buy Books in Ghana | PaperSource`;
    const attributes = [
      ["author", row.author],
      ["genre", genreByTitle[row.title] ?? "Books"],
      ["format", formatByTitle[row.title] ?? "Paperback"],
      ...(seriesByTitle[row.title] ? [["series", seriesByTitle[row.title]]] : []),
      ["seo_title", seoTitle],
    ];
    for (const [key, value] of attributes) {
      await sql`insert into product_attributes (product_id, variant_id, namespace, key, value_text, position)
        select ${product.id}, ${variant.id}, 'bibliographic', ${key}, ${value}, 20
        where not exists (select 1 from product_attributes where product_id = ${product.id} and namespace = 'bibliographic' and key = ${key})`;
    }

    const aliases = new Set([
      clean(row.title), compact(row.title), clean(row.author), `${clean(row.title)} ${clean(row.author)}`,
      `${clean(row.author)} ${clean(row.title)}`, ...(row.isbn ? [row.isbn, `ISBN ${row.isbn}`] : []),
      ...(seriesByTitle[row.title] ? [seriesByTitle[row.title], `${seriesByTitle[row.title]} books`] : []),
    ]);
    for (const alias of aliases) {
      if (!alias) continue;
      await sql`insert into product_aliases (product_id, variant_id, alias)
        select ${product.id}, ${variant.id}, ${alias}
        where not exists (select 1 from product_aliases where product_id = ${product.id} and lower(alias) = lower(${alias}))`;
    }

    await sql`update product_images set alt = ${`${row.title} by ${row.author} — front cover`} where product_id = ${product.id} and position = 0`;
    await sql`update product_images set alt = ${`${row.title} by ${row.author} — back cover`} where product_id = ${product.id} and position = 1`;
    await sql`update products p set search_document = to_tsvector('simple', coalesce(p.name, '') || ' ' || coalesce(p.description, '') || ' ' || coalesce((select string_agg(a.alias, ' ') from product_aliases a where a.product_id = p.id), '') || ' ' || coalesce((select string_agg(pa.value_text, ' ') from product_attributes pa where pa.product_id = p.id), '')), updated_at = now() where p.id = ${product.id}`;

    row.seoTitle = seoTitle;
    row.genre = genreByTitle[row.title] ?? "Books";
    row.format = formatByTitle[row.title] ?? "Paperback";
    if (seriesByTitle[row.title]) row.series = seriesByTitle[row.title];
  }
  await writeFile(dataPath, `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`Enriched ${rows.length} book products.`);
} finally {
  await sql.end({ timeout: 5 });
}
