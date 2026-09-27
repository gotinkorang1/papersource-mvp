import { readFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
if (!process.env.CLOUDINARY_URL) throw new Error("CLOUDINARY_URL is required");

const root = process.cwd();
const booksDir = path.join(root, "public", "books", "new");
const price = (cedis) => cedis * 100;
const rows = [
  { title: "The Ruins of Gorlan", author: "John Flanagan", isbn: "9780439849673", brand: "Scholastic Press", category: "middle-grade-fiction", cedis: 50, front: "WhatsApp Image 2026-09-15 at 10.27.00 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.27.06 AM.jpeg", description: "Will Treaty begins his training as a Ranger and is drawn into a dangerous mission to protect Araluen from a growing threat in this fast-paced fantasy adventure." },
  { title: "What If... All the Boys Wanted You", author: "Liz Ruckdeschel; Sara James", isbn: "038573297X", brand: "Delacorte Books for Young Readers", category: "young-adult-fiction", cedis: 50, front: "WhatsApp Image 2026-09-15 at 10.29.20 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.29.31 AM.jpeg", description: "A choice-driven young-adult romance in which readers decide how the story unfolds when a girl suddenly finds herself at the center of everyone’s attention." },
  { title: "The Watsons Go to Birmingham—1963", author: "Christopher Paul Curtis", isbn: "9780440414124", brand: "Yearling", category: "historical-fiction", cedis: 50, front: "WhatsApp Image 2026-09-15 at 10.29.37 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.29.42 AM.jpeg", description: "The Watson family’s funny, tender road trip to Birmingham becomes a life-changing encounter with the realities of racism and the 1963 church bombing." },
  { title: "Rescue Dogs: Ember", author: "Jane B. Mason; Sarah Hines Stephens", isbn: "9781338362022", brand: "Scholastic Press", category: "children's-books", cedis: 50, front: "WhatsApp Image 2026-09-15 at 10.29.52 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.29.59 AM.jpeg", description: "Ember is a brave rescue dog learning to trust again while helping people and other animals in this warm, action-filled animal story." },
  { title: "Becoming Naomi León", author: "Pam Muñoz Ryan", isbn: "9780439269971", brand: "Scholastic Press", category: "middle-grade-fiction", cedis: 50, front: "WhatsApp Image 2026-09-15 at 10.30.09 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.30.14 AM.jpeg", description: "Naomi and her little brother Owen set out on a whirlwind journey to keep their family together and discover the strength of love, loyalty and belonging." },
  { title: "The Wanderer", author: "Sharon Creech", isbn: "9780064410328", brand: "HarperCollins", category: "middle-grade-fiction", cedis: 50, front: "WhatsApp Image 2026-09-15 at 10.30.21 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.30.26 AM.jpeg", description: "Thirteen-year-old Sophie sails across the Atlantic with her cousins, recording a journey of survival, family stories, grief and self-discovery." },
  { title: "Wringer", author: "Jerry Spinelli", isbn: "9780064405782", brand: "HarperCollins", category: "young-adult-fiction", cedis: 50, front: "WhatsApp Image 2026-09-15 at 10.30.34 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.30.40 AM.jpeg", description: "Palmer dreads the birthday that will make him a wringer, forcing him to participate in a cruel town tradition, until friendship gives him the courage to stand up for what he believes." },
  { title: "Pay Attention, Carter Jones", author: "Gary D. Schmidt", isbn: "978035846302?", brand: "Clarion Books", category: "middle-grade-fiction", cedis: 50, front: "WhatsApp Image 2026-09-15 at 10.31.25 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.31.34 AM.jpeg", description: "On Carter’s first day of middle school, an unexpected English butler helps him navigate family chaos, cricket, friendship and a painful secret." },
  { title: "The 39 Clues: The Maze of Bones", author: "Rick Riordan", isbn: "9780545887472", brand: "Houghton Mifflin Harcourt", category: "mystery-thriller", cedis: 40, front: "WhatsApp Image 2026-09-15 at 10.32.14 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.32.20 AM.jpeg", description: "Amy and Dan Cahill race around the world to uncover the family’s hidden 39 Clues in the first high-stakes adventure of the series." },
  { title: "Island of the Blue Dolphins", author: "Scott O’Dell", isbn: "9780547328614", brand: "Houghton Mifflin Harcourt", category: "classics", cedis: 40, front: "WhatsApp Image 2026-09-15 at 10.32.27 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.32.31 AM.jpeg", description: "After being left alone on San Nicolas Island, Karana must use courage, ingenuity and patience to survive while waiting for a ship that may never return." },
  { title: "The Hero Two Doors Down", author: "Sharon Robinson", isbn: "9780545804523", brand: "Scholastic Press", category: "historical-fiction", cedis: 40, front: "WhatsApp Image 2026-09-15 at 10.32.37 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.32.41 AM.jpeg", description: "A young Brooklyn boy forms an unforgettable friendship with his new neighbor, baseball legend Jackie Robinson, during the 1948 season." },
  { title: "Half a Chance", author: "Cynthia Lord", isbn: "9780545837675", brand: "Scholastic Press", category: "middle-grade-fiction", cedis: 40, front: "WhatsApp Image 2026-09-15 at 10.32.48 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.32.53 AM.jpeg", description: "Lucy enters a photography contest and discovers friendship, courage and a way to help her family face changes that threaten to tear them apart." },
  { title: "A Handful of Stars", author: "Cynthia Lord", isbn: "9780545700283", brand: "Scholastic Press", category: "middle-grade-fiction", cedis: 40, front: "WhatsApp Image 2026-09-15 at 10.32.59 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.33.04 AM.jpeg", description: "Lily and Salma build a friendship across cultural and economic differences while pursuing dreams of art, family and a blueberry queen crown." },
  { title: "Just Juice", author: "Karen Hesse", isbn: "9780590033831", brand: "Scholastic Press", category: "children's-books", cedis: 40, front: "WhatsApp Image 2026-09-15 at 10.33.38 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.33.45 AM.jpeg", description: "Juice Faulstich struggles with reading and numbers, but when her family faces a serious problem, she finds the determination to help them." },
  { title: "The Hot and Cold Summer", author: "Johanna Hurwitz", isbn: "0590428586", brand: "Scholastic Press", category: "children's-books", cedis: 40, front: "WhatsApp Image 2026-09-15 at 10.33.45 AM (1).jpeg", back: "WhatsApp Image 2026-09-15 at 10.33.46 AM.jpeg", description: "Rory, Derek and Bolivia discover that a summer friendship can be tested by misunderstandings, new feelings and the challenge of making room for one more person." },
  { title: "Escaping the Giant Wave", author: "Peg Kehret", isbn: "0439315437", brand: "Scholastic Press", category: "mystery-thriller", cedis: 40, front: "WhatsApp Image 2026-09-15 at 10.33.46 AM (1).jpeg", back: "WhatsApp Image 2026-09-15 at 10.33.46 AM (2).jpeg", description: "Kyle’s family vacation on the Oregon coast turns into a fight for survival when an earthquake, fire and tsunami threaten to overwhelm them." },
  { title: "EllRay Jakes Rocks the Holidays!", author: "Sally Warner", isbn: "9781338159431", brand: "Scholastic Press", category: "children's-books", cedis: 40, front: "WhatsApp Image 2026-09-15 at 10.33.49 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.33.56 AM.jpeg", description: "EllRay must face a holiday performance, a difficult dare and the consequences of trying to prove himself to a former friend." },
  { title: "Gooseberry Park", author: "Cynthia Rylant", isbn: "9780590497152", brand: "Scholastic Press", category: "children's-books", cedis: 40, front: "WhatsApp Image 2026-09-15 at 10.34.28 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.34.33 AM.jpeg", description: "When an ice storm threatens a dog and her puppies, a loyal friend faces an icy, dangerous journey to bring them home." },
  { title: "Surviving Sharks and Other Dangerous Creatures", author: "Allan Zullo", isbn: "9780545186384", brand: "Scholastic Press", category: "children's-books", cedis: 40, front: "WhatsApp Image 2026-09-15 at 10.34.53 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.35.04 AM.jpeg", description: "True survival stories introduce young readers to children who faced sharks, cougars, elephants and other dangerous animals and lived to tell the tale." },
  { title: "Not Guilty: Five Times When Justice Failed", author: "George Sullivan", isbn: "0590487947", brand: "Scholastic Press", category: "historical-fiction", cedis: 40, front: "WhatsApp Image 2026-09-15 at 10.35.12 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.35.18 AM.jpeg", description: "Five gripping historical cases reveal how innocent people were wrongly convicted and how justice can fail when prejudice and fear take over." },
  { title: "The Haunted Museum: The Phantom Music Box", author: "Suzanne Weyn", isbn: "9780545795654", brand: "Scholastic Press", category: "mystery-thriller", cedis: 40, front: "WhatsApp Image 2026-09-15 at 10.35.27 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.35.32 AM.jpeg", description: "Emma’s fascination with a haunted music box becomes frighteningly real when its ghostly dancers appear to follow her home." },
  { title: "Goosebumps HorrorLand: Creep from the Deep", author: "R. L. Stine", isbn: "9780439818701", brand: "Scholastic Press", category: "mystery-thriller", cedis: 40, front: "WhatsApp Image 2026-09-15 at 10.35.39 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.35.45 AM.jpeg", description: "Billy and Sheena join a dangerous treasure hunt at sea and discover that HorrorLand’s monsters are closer than they imagined." },
  { title: "Encyclopedia Brown and the Case of the Dead Eagles", author: "Donald J. Sobol", isbn: "9780142411353", brand: "Puffin", category: "mystery-thriller", cedis: 40, front: "WhatsApp Image 2026-09-15 at 10.35.53 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.35.59 AM.jpeg", description: "Encyclopedia Brown uses logic, trivia and sharp observation to solve baffling neighborhood mysteries—and readers can solve the clues too." },
  { title: "Otis Spofford", author: "Beverly Cleary", isbn: "9780439239233", brand: "Scholastic Press", category: "humor", cedis: 40, front: "WhatsApp Image 2026-09-15 at 10.36.07 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.36.20 AM.jpeg", description: "Mischief follows Otis Spofford everywhere as his teasing, practical jokes and big personality turn ordinary school days into comic adventures." },
  { title: "I Am Malala: Young Readers Edition", author: "Malala Yousafzai with Patricia McCormick", isbn: "9780316327916", brand: "Little, Brown Books for Young Readers", category: "historical-fiction", cedis: 60, front: "WhatsApp Image 2026-09-15 at 10.38.02 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.38.07 AM.jpeg", description: "Malala Yousafzai tells the story of standing up for girls’ education and becoming a global symbol of courage, peace and hope." },
  { title: "The Fault in Our Stars", author: "John Green", isbn: "9780142424179", brand: "Penguin Books", category: "young-adult-fiction", cedis: 60, front: "WhatsApp Image 2026-09-15 at 10.38.21 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.38.28 AM.jpeg", description: "Hazel and Augustus meet in a cancer support group and discover a funny, fierce and heartbreaking love story about living fully." },
  { title: "Alex Rider: Point Blanc", author: "Anthony Horowitz", isbn: "9781406360202", brand: "Walker Books", category: "mystery-thriller", cedis: 60, front: "WhatsApp Image 2026-09-15 at 10.38.38 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 10.38.44 AM.jpeg", description: "Teen spy Alex Rider infiltrates an exclusive academy in the Alps and uncovers a deadly secret threatening the world beyond the school gates." },
  { title: "The Fowl Twins", author: "Eoin Colfer", isbn: "9781368043755", brand: "Disney-Hyperion", category: "fantasy", cedis: 60, front: "WhatsApp Image 2026-09-15 at 11.03.39 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 11.03.44 AM.jpeg", description: "Mythical creatures, criminal schemes and sibling rivalry collide when Artemis Fowl’s twin brothers are pulled into a wildly inventive adventure." },
  { title: "Artemis Fowl: The Lost Colony", author: "Eoin Colfer", isbn: "9780786849567", brand: "Miramax Books", category: "fantasy", cedis: 60, front: "WhatsApp Image 2026-09-15 at 11.03.52 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 11.03.57 AM.jpeg", description: "Artemis Fowl encounters a lost fairy colony and a dangerous rival in this clever, action-packed fantasy adventure." },
  { title: "Percy Jackson and the Olympians: The Titan’s Curse", author: "Rick Riordan", isbn: "9781423101451", brand: "Scholastic Press", category: "fantasy", cedis: 60, front: "WhatsApp Image 2026-09-15 at 11.04.05 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 11.04.09 AM.jpeg", description: "Percy and his friends race to rescue Grover and two mysterious half-bloods while the Titan lord Kronos sets a dangerous trap." },
  { title: "Divergent", author: "Veronica Roth", isbn: "9780062024039", brand: "Katherine Tegen Books", category: "young-adult-fiction", cedis: 60, front: "WhatsApp Image 2026-09-15 at 11.04.16 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 11.04.20 AM.jpeg", description: "In a divided future Chicago, Tris Prior must choose a faction, confront a dangerous conspiracy and decide who she is willing to become." },
  { title: "You Don’t Live Here", author: "Robyn Schneider", isbn: "9780062568120", brand: "Katherine Tegen Books", category: "young-adult-fiction", cedis: 60, front: "WhatsApp Image 2026-09-15 at 11.04.28 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 11.04.32 AM.jpeg", description: "After her world changes, Sasha finds unexpected friendship, love and a new sense of self while learning to stop living by everyone else’s directions." },
  { title: "Giants Beware!", author: "Jorge Aguirre; Rafael Rosado", isbn: "9781596435827", brand: "First Second", category: "children's-books", cedis: 60, front: "WhatsApp Image 2026-09-15 at 11.04.44 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 11.04.50 AM.jpeg", description: "Claudette dreams of becoming a giant slayer and pulls her friends into a funny, action-filled quest far beyond the safety of their little town." },
  { title: "Esperanza Rising", author: "Pam Muñoz Ryan", isbn: "9780439120425", brand: "Scholastic Press", category: "historical-fiction", cedis: 50, front: "WhatsApp Image 2026-09-15 at 11.05.32 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 11.05.36 AM.jpeg", description: "After tragedy forces Esperanza from her family ranch in Mexico to a migrant camp in California, she learns resilience, hope and the meaning of home." },
  { title: "The Notorious Benedict Arnold", author: "Steve Sheinkin", isbn: "9781596434868", brand: "Scholastic Press", category: "historical-fiction", cedis: 50, front: "WhatsApp Image 2026-09-15 at 11.05.58 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 11.06.02 AM.jpeg", description: "A vivid true account of Benedict Arnold’s rise as a courageous Revolutionary War hero and his shocking transformation into America’s most infamous traitor." },
  { title: "Masterminds", author: "Gordon Korman", isbn: "9781338033359", brand: "Scholastic Press", category: "mystery-thriller", cedis: 50, front: "WhatsApp Image 2026-09-15 at 11.06.34 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 11.06.44 AM.jpeg", description: "In the seemingly perfect town of Serenity, Eli and his friends uncover clues that reveal their community—and their parents—are not what they seem." },
  { title: "The Hope Chest", author: "Karen Schwabach", isbn: "9780375840968", brand: "Yearling", category: "historical-fiction", cedis: 50, front: "WhatsApp Image 2026-09-15 at 11.06.51 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 11.07.01 AM.jpeg", description: "In 1917, Violet follows the trail of her missing sister to Tennessee, where the fight for women’s voting rights changes both of their lives." },
  { title: "Assassin", author: "Anna Myers", isbn: "0439851041", brand: "Scholastic Press", category: "historical-fiction", cedis: 50, front: "WhatsApp Image 2026-09-15 at 11.07.10 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 11.07.13 AM.jpeg", description: "Bella’s account of a dangerous plan brings the world of an assassin and the moral choices surrounding violence into sharp, suspenseful focus." },
  { title: "Tangerine", author: "Edward Bloor", isbn: "9780152057800", brand: "Harcourt Paperbacks", category: "middle-grade-fiction", cedis: 50, front: "WhatsApp Image 2026-09-15 at 11.07.19 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 11.07.22 AM.jpeg", description: "Paul Fisher sees what others miss in his strange new Florida town and finds the courage to face family secrets through his love of soccer." },
  { title: "P.S. Be Eleven", author: "Rita Williams-Garcia", isbn: "9780061938641", brand: "Quill Tree Books", category: "historical-fiction", cedis: 50, front: "WhatsApp Image 2026-09-15 at 11.07.31 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 11.07.35 AM.jpeg", description: "Delphine and her sisters return to Brooklyn changed by their summer with the Black Panthers and face a turbulent year of family, school and growing up." },
  { title: "Ella Enchanted", author: "Gail Carson Levine", isbn: "9780590920681", brand: "Scholastic Press", category: "fantasy", cedis: 50, front: "WhatsApp Image 2026-09-15 at 11.07.41 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 11.07.47 AM.jpeg", description: "Cursed with absolute obedience, Ella sets out to break the spell and finds courage, friendship and adventure among ogres, giants, stepsisters and princes." },
  { title: "A Girl Named Disaster", author: "Nancy Farmer", isbn: "9780545356626", brand: "Scholastic Press", category: "historical-fiction", cedis: 50, front: "WhatsApp Image 2026-09-15 at 11.08.27 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 11.08.31 AM.jpeg", description: "Eleven-year-old Nhamo escapes an arranged marriage and faces a dangerous journey across Mozambique and Zimbabwe in search of the father she has never known." },
  { title: "The Madman of Piney Woods", author: "Christopher Paul Curtis", isbn: "9780545819756", brand: "Scholastic Press", category: "historical-fiction", cedis: 50, front: "WhatsApp Image 2026-09-15 at 11.08.37 AM.jpeg", back: "WhatsApp Image 2026-09-15 at 11.08.43 AM.jpeg", description: "Two boys from very different worlds discover that their lives are connected by a mysterious presence in the forest in this suspenseful companion to Elijah of Buxton." },
];

const cloudinary = new URL(process.env.CLOUDINARY_URL);
const cloudName = cloudinary.hostname;
const apiKey = decodeURIComponent(cloudinary.username);
const apiSecret = decodeURIComponent(cloudinary.password);
const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 3, prepare: false });
const slugify = (value) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const normalize = (value) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");
const isbnValue = (value) => value && !value.includes("?") ? value : null;

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
  if (!response.ok) throw new Error(`Cloudinary upload failed for ${fileName}: ${response.status} ${(await response.text()).slice(0, 300)}`);
  return (await response.json()).public_id;
}

async function findCanonical(row, existingProducts) {
  const isbn = isbnValue(row.isbn);
  if (isbn) {
    const matches = await sql`select p.id,p.slug,p.status,p.created_at from products p join product_attributes a on a.product_id=p.id where a.namespace='bibliographic' and a.key='isbn' and a.value_text=${isbn} and p.deleted_at is null order by (p.status='active') desc,p.created_at asc`;
    if (matches.length) return matches[0];
  }
  return existingProducts.filter((p) => normalize(p.name) === normalize(row.title)).sort((a, b) => Number(b.status === "active") - Number(a.status === "active"))[0] ?? null;
}

async function archiveDuplicate(productId, canonicalId) {
  if (productId === canonicalId) return;
  const [orders] = await sql`select count(*)::int as count from order_items where product_id=${productId}`;
  if (orders.count === 0) await sql`update products set status='archived', deleted_at=coalesce(deleted_at, now()), updated_at=now() where id=${productId}`;
  else console.warn(`Kept order-linked duplicate ${productId}; it cannot be archived safely.`);
}

try {
  const [categoryRoot] = await sql`select id from categories where slug='books-notebooks' and deleted_at is null limit 1`;
  if (!categoryRoot) throw new Error("Books & Notebooks category was not found");
  const categories = Object.fromEntries((await sql`select id,slug from categories where deleted_at is null`).map((r) => [r.slug, r.id]));
  const existingProducts = await sql`select id,name,status,slug from products where deleted_at is null`;
  const seen = new Set();
  for (const row of rows) {
    if (seen.has(row.title)) continue;
    seen.add(row.title);
    const slug = `book-${slugify(row.title)}`;
    const isbn = isbnValue(row.isbn);
    const sku = isbn ? `ISBN-${isbn}` : `BOOK-${slugify(row.title).slice(0, 40)}`;
    const existing = await findCanonical(row, existingProducts);
    const productSlug = existing?.slug || slug;
    const frontId = await upload(row.front, `papersource/books/${productSlug}/front`);
    const backId = await upload(row.back, `papersource/books/${productSlug}/back`);
    const [brand] = await sql`insert into brands (name,slug,active) values (${row.brand},${slugify(row.brand)},true) on conflict (slug) do update set name=excluded.name,active=true,deleted_at=null,updated_at=now() returning id`;
    const categoryId = categories[row.category] || categoryRoot.id;
    let product;
    if (existing) {
      [product] = await sql`update products set name=${row.title},brand_id=${brand.id},category_id=${categoryId},product_type='standard',description=${row.description},status='active',deleted_at=null,updated_at=now() where id=${existing.id} returning id,slug`;
      const duplicateRows = isbn ? await sql`select p.id from products p join product_attributes a on a.product_id=p.id where a.namespace='bibliographic' and a.key='isbn' and a.value_text=${isbn} and p.id<>${product.id} and p.deleted_at is null` : [];
      for (const duplicate of duplicateRows) await archiveDuplicate(duplicate.id, product.id);
    } else {
      [product] = await sql`insert into products (name,slug,brand_id,category_id,product_type,description,status) values (${row.title},${slug},${brand.id},${categoryId},'standard',${row.description},'active') on conflict (slug) do update set name=excluded.name,brand_id=excluded.brand_id,category_id=excluded.category_id,description=excluded.description,status='active',deleted_at=null,updated_at=now() returning id,slug`;
    }
    const [variant] = await sql`insert into product_variants (product_id,sku,name,unit_label,base_unit_price,currency,active) values (${product.id},${sku},${row.title},'each',${price(row.cedis)},'GHS',true) on conflict (sku) do update set product_id=excluded.product_id,name=excluded.name,base_unit_price=excluded.base_unit_price,active=true returning id`;
    await sql`insert into inventory (variant_id,on_hand,reserved,low_stock_threshold) values (${variant.id},10,0,2) on conflict (variant_id) do update set on_hand=10,low_stock_threshold=2`;
    for (const [position, imageId, label] of [[0,frontId,"front cover"],[1,backId,"back cover"]]) {
      const [existingImage] = await sql`select id from product_images where product_id=${product.id} and position=${position} limit 1`;
      if (existingImage) await sql`update product_images set variant_id=${variant.id},cloudinary_public_id=${imageId},alt=${`${row.title} ${label}`} where id=${existingImage.id}`;
      else await sql`insert into product_images (product_id,variant_id,cloudinary_public_id,alt,position) values (${product.id},${variant.id},${imageId},${`${row.title} ${label}`},${position})`;
    }
    const aliases = [...new Set([row.title,row.author,row.isbn,`${row.title} ${row.author}`].filter(Boolean))];
    for (const alias of aliases) await sql`insert into product_aliases (product_id,alias) select ${product.id},${alias} where not exists (select 1 from product_aliases where product_id=${product.id} and lower(alias)=lower(${alias}))`;
    const attrs = [["author",row.author],["isbn",isbn],["publisher",row.brand],["price_source","orange cover label"]].filter(([,value]) => value);
    for (const [key,value] of attrs) await sql`insert into product_attributes (product_id,namespace,key,value_text) values (${product.id},'bibliographic',${key},${String(value)}) on conflict do nothing`;
    await sql`update products p set search_document=to_tsvector('simple',coalesce(p.name,'')||' '||coalesce(p.description,'')||' '||coalesce((select string_agg(a.alias,' ') from product_aliases a where a.product_id=p.id),'')||' '||coalesce((select string_agg(v.sku||' '||coalesce(v.barcode,''),' ') from product_variants v where v.product_id=p.id),'')) where p.id=${product.id}`;
    await sql`insert into price_tiers (variant_id,minimum_quantity,maximum_quantity,unit_price,request_quote,currency,active) values (${variant.id},1,null,${price(row.cedis)},false,'GHS',true) on conflict do nothing`;
    console.log(`${row.title} -> GHS ${row.cedis} | ${row.brand} | ${row.category}`);
  }
  for (const row of rows) {
    const isbn = isbnValue(row.isbn);
    const [product] = await sql`select p.id from products p join product_attributes a on a.product_id=p.id and a.namespace='bibliographic' and a.key='price_source' where lower(p.name)=lower(${row.title}) and p.deleted_at is null limit 1`;
    if (!product) continue;
    const sku = isbn ? `ISBN-${isbn}` : `BOOK-${slugify(row.title).slice(0, 40)}`;
    await sql`update product_variants set active=(sku=${sku}) where product_id=${product.id}`;
    const [variant] = await sql`select id from product_variants where product_id=${product.id} and sku=${sku} limit 1`;
    if (variant) await sql`update inventory set on_hand=10,low_stock_threshold=2 where variant_id=${variant.id}`;
    await sql`delete from product_images where id in (select id from (select id,row_number() over (partition by product_id,position order by id desc) as rn from product_images where product_id=${product.id}) ranked where rn>1)`;
  }
  console.log(`Imported or updated ${seen.size} unique books; duplicates in the image batch were skipped.`);
} finally {
  await sql.end();
}
