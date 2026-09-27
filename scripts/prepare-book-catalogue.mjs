import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const booksDir = path.join(root, "public", "books");
const outputPath = path.join(root, "data", "books.catalogue.json");

const books = [
  ["Stranded", "Jeff Probst"],
  ["The BFG", "Roald Dahl"],
  ["Detective Stories", "Philip Pullman"],
  ["Weedflower", "Cynthia Kadohata"],
  ["Artemis Fowl: The Arctic Incident", "Eoin Colfer"],
  ["Little House in the Big Woods", "Laura Ingalls Wilder"],
  ["Stowaway", "Karen Hesse"],
  ["The Savage Fortress", "Sarwat Chadda"],
  ["Stormbreaker", "Anthony Horowitz"],
  ["Maniac Magee", "Jerry Spinelli"],
  ["Kira-Kira", "Cynthia Kadohata"],
  ["There's a Boy in the Girls' Bathroom", "Louis Sachar"],
  ["The Bad Beginning", "Lemony Snicket"],
  ["Diary of a Wimpy Kid: Party Pooper", "Jeff Kinney"],
  ["Bodyguard: Ransom", "Chris Bradford"],
  ["Heart of a Samurai", "Margi Preus"],
  ["Ignite", "Sara B. Larson"],
  ["Picture Perfect", "Jodi Picoult"],
  ["Diary of a Wimpy Kid: Hot Mess", "Jeff Kinney"],
  ["The Last Kids on Earth and the Zombie Parade", "Max Brallier"],
  ["Sword Song", "Bernard Cornwell"],
  ["It Ends with Us", "Colleen Hoover"],
  ["The Da Vinci Code", "Dan Brown"],
  ["Becoming", "Michelle Obama"],
  ["Origin", "Dan Brown"],
  ["Myths & Legends", "Miles Kelly"],
  ["Magical Stories", "Victoria Parker"],
  ["Harry Potter and the Half-Blood Prince", "J. K. Rowling"],
  ["The Boys from Biloxi", "John Grisham"],
  ["Space Dumplins", "Craig Thompson"],
  ["Alex Rider: Eagle Strike", "Anthony Horowitz"],
  ["Vanishing Acts", "Jodi Picoult"],
  ["Precious Gifts", "Danielle Steel"],
  ["Amulet: The Stonekeeper", "Kazu Kibuishi"],
  ["A Tale of Magic...", "Chris Colfer"],
  ["Goosebumps: Creepy Creatures", "R. L. Stine"],
  ["Bone: The Great Cow Race", "Jeff Smith"],
  ["Percy Jackson: The Throne of Fire", "Rick Riordan"],
  ["Percy Jackson: The Serpent's Shadow", "Rick Riordan"],
  ["The Haunting of Gabriel Ashe", "Dan Poblocki"],
  ["Wings of Fire: Escaping Peril", "Tui T. Sutherland"],
];

function slugify(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function parseTime(name) {
  const match = name.match(/at (\d+)\.(\d+)\.(\d+) (AM|PM)/);
  if (!match) throw new Error(`Cannot parse timestamp from ${name}`);
  const [, hour, minute, second, meridiem] = match;
  const date = new Date(2026, 8, 8, Number(hour) % 12 + (meridiem === "PM" ? 12 : 0), Number(minute), Number(second));
  return date.getTime();
}

async function findOnlineMetadata(title, author) {
  const query = new URLSearchParams({ title, author, limit: "10", fields: "title,author_name,isbn,first_publish_year,edition_key,key,publisher,number_of_pages_median" });
  const response = await fetch(`https://openlibrary.org/search.json?${query}`);
  if (!response.ok) throw new Error(`Open Library returned ${response.status} for ${title}`);
  const result = await response.json();
  const doc = result.docs?.[0];
  if (!doc) return {};
  const workKey = doc.key?.replace(/^\/works\//, "");
  let description = "";
  if (workKey) {
    const workResponse = await fetch(`https://openlibrary.org/works/${workKey}.json`);
    if (workResponse.ok) {
      const work = await workResponse.json();
      description = typeof work.description === "string" ? work.description : work.description?.value ?? "";
    }
  }
  const isbn13 = doc.isbn?.find((value) => /^978\d{10}$/.test(value) || /^979\d{10}$/.test(value));
  return {
    matchedTitle: doc.title ?? title,
    matchedAuthors: doc.author_name ?? [author],
    isbn: isbn13 ?? doc.isbn?.[0] ?? null,
    year: doc.first_publish_year ?? null,
    pages: doc.number_of_pages_median ?? null,
    publisher: doc.publisher?.[0] ?? null,
    description,
    source: workKey ? `https://openlibrary.org/works/${workKey}` : "https://openlibrary.org/",
  };
}

const files = (await readdir(booksDir)).filter((file) => /\.(jpe?g|png)$/i.test(file)).sort((a, b) => parseTime(a) - parseTime(b));
if (files.length !== books.length * 2) throw new Error(`Expected ${books.length * 2} images, found ${files.length}`);

const rows = [];
for (let index = 0; index < books.length; index += 1) {
  const [title, author] = books[index];
  const metadata = await findOnlineMetadata(title, author);
  rows.push({
    position: index + 1,
    title,
    author,
    slug: slugify(`${title}-${author}`),
    frontFile: files[index * 2],
    backFile: files[index * 2 + 1],
    ...metadata,
  });
  console.log(`${String(index + 1).padStart(2, "0")} ${title} | ${metadata.isbn ?? "no ISBN"}`);
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
console.log(`Wrote ${rows.length} rows to ${outputPath}`);
