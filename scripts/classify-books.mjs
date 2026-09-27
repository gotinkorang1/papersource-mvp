import { readFile } from "node:fs/promises";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });
const rows = JSON.parse(await readFile("data/books.catalogue.json", "utf8"));
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", prepare: false });

const classifications = {
  "Stranded": ["Puffin", "Middle Grade Fiction"],
  "The BFG": ["Jonathan Cape", "Children’s Books"],
  "Detective Stories": ["Kingfisher", "Mystery & Thriller"],
  Weedflower: ["Atheneum Books for Young Readers", "Middle Grade Fiction"],
  "Artemis Fowl: The Arctic Incident": ["Disney-Hyperion", "Fantasy"],
  "Little House in the Big Woods": ["Harper", "Classics"],
  Stowaway: ["Perfection Learning", "Middle Grade Fiction"],
  "The Savage Fortress": ["Scholastic", "Young Adult Fiction"],
  Stormbreaker: ["Scholastic", "Young Adult Fiction"],
  "Maniac Magee": ["Perfection Learning", "Middle Grade Fiction"],
  "Kira-Kira": ["Simon & Schuster", "Middle Grade Fiction"],
  "There's a Boy in the Girls' Bathroom": ["Scholastic", "Middle Grade Fiction"],
  "The Bad Beginning": ["HarperTrophy", "Children’s Books"],
  "Diary of a Wimpy Kid: Party Pooper": ["Abrams", "Humor"],
  "Bodyguard: Ransom": ["Puffin", "Young Adult Fiction"],
  "Heart of a Samurai": ["Abrams", "Historical Fiction"],
  Ignite: ["Scholastic Press", "Young Adult Fiction"],
  "Picture Perfect": ["Penguin", "Romance & Contemporary Fiction"],
  "Diary of a Wimpy Kid: Hot Mess": ["Abrams", "Humor"],
  "The Last Kids on Earth and the Zombie Parade": ["Viking Books for Young Readers", "Middle Grade Fiction"],
  "Sword Song": ["HarperCollins", "Historical Fiction"],
  "It Ends with Us": ["Simon & Schuster", "Romance"],
  "The Da Vinci Code": ["Doubleday", "Mystery & Thriller"],
  Becoming: ["Crown", "Fiction"],
  Origin: ["Doubleday", "Mystery & Thriller"],
  "Myths & Legends": ["Miles Kelly", "Classics"],
  "Magical Stories": ["Miles Kelly", "Fantasy"],
  "Harry Potter and the Half-Blood Prince": ["Bloomsbury", "Fantasy"],
  "The Boys from Biloxi": ["Doubleday", "Mystery & Thriller"],
  "Space Dumplins": ["Scholastic", "Middle Grade Fiction"],
  "Alex Rider: Eagle Strike": ["Walker Books", "Young Adult Fiction"],
  "Vanishing Acts": ["Atria Books", "Mystery & Thriller"],
  "Precious Gifts": ["Dell", "Romance & Contemporary Fiction"],
  "Amulet: The Stonekeeper": ["Graphix", "Fantasy"],
  "A Tale of Magic...": ["Little, Brown Books for Young Readers", "Fantasy"],
  "Goosebumps: Creepy Creatures": ["Graphix", "Children’s Books"],
  "Bone: The Great Cow Race": ["Scholastic", "Humor"],
  "Percy Jackson: The Throne of Fire": ["Disney-Hyperion", "Fantasy"],
  "Percy Jackson: The Serpent's Shadow": ["Disney-Hyperion", "Fantasy"],
  "The Haunting of Gabriel Ashe": ["Scholastic Press", "Mystery & Thriller"],
  "Wings of Fire: Escaping Peril": ["Scholastic", "Fantasy"],
};

function slugify(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

try {
  const categories = await sql`select id,name from categories where active=true and deleted_at is null`;
  const categoryByName = new Map(categories.map((row) => [row.name, row.id]));
  for (const row of rows) {
    const [brandName, categoryName] = classifications[row.title] ?? ["Imported Catalogue", "Books"];
    const categoryId = categoryByName.get(categoryName);
    if (!categoryId) throw new Error(`Category not found: ${categoryName}`);
    const brandSlug = slugify(brandName);
    const [brand] = await sql`insert into brands (name,slug,active) values (${brandName},${brandSlug},true) on conflict (slug) do update set name=excluded.name,active=true returning id`;
    const [product] = await sql`update products set brand_id=${brand.id},category_id=${categoryId},updated_at=now() where slug=${row.slug} and deleted_at is null returning id`;
    if (!product) throw new Error(`Product not found: ${row.title}`);
    console.log(`${String(row.position).padStart(2,"0")} ${row.title} -> ${brandName} / ${categoryName}`);
  }
  console.log(`Classified ${rows.length} books.`);
} finally {
  await sql.end();
}
