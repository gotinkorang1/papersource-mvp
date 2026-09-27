import { readFile, writeFile } from "node:fs/promises";
import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });
const dataPath = "data/books.catalogue.json";
const rows = JSON.parse(await readFile(dataPath, "utf8"));
const copy = {
  "Stranded": "When a sailing trip goes wrong, four young people must rely on courage, teamwork and quick thinking to survive on a remote island. A fast-moving adventure about friendship and family.",
  "The BFG": "Sophie discovers that the Big Friendly Giant is far kinder than the giants around him. Together they hatch a bold plan to protect children everywhere in this beloved imaginative classic.",
  "Detective Stories": "A lively collection of classic and modern mysteries featuring clever clues, surprising suspects and unforgettable detectives. A strong choice for young readers who enjoy solving puzzles through fiction.",
  "Weedflower": "Sumiko’s life changes when her Japanese-American family is forced into an internment camp during the Second World War. This moving historical novel explores resilience, friendship and finding hope in difficult times.",
  "Artemis Fowl: The Arctic Incident": "Artemis Fowl must put his criminal genius to work for an unlikely cause when a family crisis leads him to the frozen north. A clever fantasy adventure filled with technology, magic and danger.",
  "Little House in the Big Woods": "Laura Ingalls Wilder’s classic story follows young Laura and her family through the seasons in their Wisconsin log cabin. A warm, detailed portrait of family life, work and celebration on the American frontier.",
  "Stowaway": "A young girl joins a dangerous voyage across the Atlantic and discovers that survival depends on bravery, resourcefulness and the kindness of strangers. A gripping historical adventure for middle-grade readers.",
  "The Savage Fortress": "Ash Mistry is pulled into an ancient battle when a mysterious fortress and a powerful demon threaten the world around him. An action-packed fantasy that blends Indian mythology with a modern coming-of-age adventure.",
  "Stormbreaker": "After his uncle’s mysterious death, teenage Alex Rider is recruited into the dangerous world of espionage. His first mission sends him into a high-tech school with a secret that could endanger thousands of lives.",
  "Maniac Magee": "Jeffrey Lionel Magee becomes a local legend as he crosses boundaries and brings people together in a divided town. A funny, compassionate story about courage, belonging and the power of an extraordinary kid.",
  "Kira-Kira": "Katie and her sister Lynn grow up in a Japanese-American family whose love and imagination help them face hardship. This award-winning novel is a tender story about family, identity and seeing beauty in everyday life.",
  "There's a Boy in the Girls' Bathroom": "Bradley Chalkers is known as the difficult kid at school, but a new counsellor sees possibilities that others miss. A thoughtful and funny story about trust, change and getting a second chance.",
  "The Bad Beginning": "The Baudelaire siblings face a greedy guardian, a stolen inheritance and one unfortunate event after another. The first book in Lemony Snicket’s darkly funny series is clever, suspenseful and delightfully unusual.",
  "Diary of a Wimpy Kid: Party Pooper": "Greg Heffley’s plans for a perfect celebration quickly turn into a hilarious family disaster. Packed with awkward moments, cartoon mischief and Greg’s unmistakable point of view.",
  "Bodyguard: Ransom": "Connor Reeves is trained to protect a young VIP, but a kidnapping plot puts his skills and his loyalties to the test. A tense teen thriller full of close calls, pursuit and undercover action.",
  "Heart of a Samurai": "Shipwrecked Japanese fisherman Manjiro is rescued by an American whaling crew and begins an extraordinary journey between two cultures. A richly researched historical adventure about courage, friendship and finding home.",
  "Ignite": "Malia carries a dangerous power that could change the balance between rival worlds. As secrets surface, she must decide who to trust and how much she is willing to risk for the people she loves.",
  "Picture Perfect": "Cassie’s seemingly perfect marriage is shaken by a discovery that forces her to question everything she thought she knew. An emotionally charged novel about memory, identity, love and the difficult search for truth.",
  "Diary of a Wimpy Kid: Hot Mess": "Greg Heffley and his family set out for a getaway that quickly becomes a hot mess of arguments, mishaps and unexpected trouble. A funny, fast read for fans of family chaos and comic embarrassment.",
  "The Last Kids on Earth and the Zombie Parade": "Jack Sullivan and his friends face a new wave of monsters while trying to keep life fun after the apocalypse. A high-energy mix of comedy, friendship, zombies and illustrated adventure.",
  "Sword Song": "Uhtred of Bebbanburg returns to a divided England where rival kings, shifting alliances and Viking armies collide. A sweeping historical adventure of battles, loyalty and one warrior’s fight for his homeland.",
  "It Ends with Us": "Lily’s new relationship seems perfect until the past and present begin to collide. Colleen Hoover’s powerful contemporary novel explores love, difficult choices and the strength it takes to break harmful patterns.",
  "The Da Vinci Code": "When a murder in the Louvre reveals a coded trail, Robert Langdon and Sophie Neveu are drawn into a race through art, history and hidden symbols. A page-turning mystery filled with puzzles, secrets and conspiracy.",
  "Becoming": "Michelle Obama shares the people, places and experiences that shaped her life—from childhood and career to the White House and beyond. An open, thoughtful memoir about purpose, resilience and becoming who you are.",
  "Origin": "Robert Langdon follows a trail of symbols and scientific questions through Spain after a startling discovery threatens to reshape humanity’s understanding of its future. A globe-spanning thriller of art, technology and belief.",
  "Myths & Legends": "An illustrated introduction to memorable myths, legends and magical stories from cultures around the world. Designed to spark curiosity and imagination in young readers.",
  "Magical Stories": "This beautifully illustrated treasury gathers enchanting tales, curious creatures, wishes and transformations for shared reading or independent discovery. A charming collection for children who love classic fantasy.",
  "Harry Potter and the Half-Blood Prince": "Harry returns to Hogwarts for a year of difficult lessons, hidden memories and growing danger. As Voldemort’s influence spreads, Harry and Dumbledore uncover clues that may decide the future of the wizarding world.",
  "The Boys from Biloxi": "Two boys from immigrant families grow up on opposite sides of the law in Biloxi, Mississippi. Decades later, their paths collide in a tense legal thriller about ambition, loyalty, revenge and justice.",
  "Space Dumplins": "Violet and her friends race across the galaxy to save a missing parent and protect their strange, wonderful home. A colourful graphic adventure about friendship, bravery and finding your place among the stars.",
  "Alex Rider: Eagle Strike": "Alex Rider is sent undercover when a powerful businessman’s environmental project hides a deadly plan. Packed with gadgets, danger and international espionage, this is a thrilling mission for young readers.",
  "Vanishing Acts": "When a child disappears, an experienced abductor and a determined mother are forced to confront the secrets surrounding the case. A suspenseful, emotionally layered novel about family, memory and impossible choices.",
  "Precious Gifts": "After a father’s death, his children gather to discover the surprising gifts and secrets he has left behind. A warm family drama about forgiveness, legacy and finding unexpected new beginnings.",
  "Amulet: The Stonekeeper": "After moving into a mysterious family home, Emily discovers a powerful amulet and a hidden world in need of help. This richly illustrated graphic novel launches an epic fantasy about courage, family and responsibility.",
  "A Tale of Magic...": "Brystal Evergreen discovers that magic lives within her at a time when using it is forbidden. Her journey leads to a secret academy and a fight for a fairer world in this enchanting fantasy adventure.",
  "Goosebumps: Creepy Creatures": "Three creepy graphic tales bring strange creatures, unsettling mysteries and classic Goosebumps scares to life. A fun pick for readers who like quick chills and illustrated horror.",
  "Bone: The Great Cow Race": "Fone Bone and his cousins are swept into a lively race and a much bigger struggle involving friendship, rivalry and danger. Jeff Smith’s expressive graphic novel combines comedy, fantasy and unforgettable characters.",
  "Percy Jackson: The Throne of Fire": "Carter and Sadie Kane must awaken an ancient Egyptian god before a ruthless enemy destroys the world. Mythology, sibling teamwork and fast-paced adventure drive this exciting fantasy quest.",
  "Percy Jackson: The Serpent's Shadow": "Carter and Sadie Kane face their most dangerous challenge as an ancient power threatens to consume the world. The thrilling conclusion to their Egyptian-magic adventure is full of courage, humour and heart.",
  "The Haunting of Gabriel Ashe": "Gabriel’s games in the woods become frighteningly real when a new friend introduces him to a monster called the Hunter. A suspenseful supernatural mystery about imagination, fear and knowing whom to trust.",
  "Wings of Fire: Escaping Peril": "Peril has spent her life obeying a dangerous queen, but new friendships make her question everything she believes. This dragon adventure explores loyalty, freedom and the courage to choose your own path.",
};

const readerFit = {
  "Stranded": "Ideal for readers who enjoy survival stories, teamwork and fast-moving adventure.",
  "The BFG": "A lovely choice for shared reading and for children who enjoy playful language, giants and big-hearted heroes.",
  "Detective Stories": "A strong pick for young mystery fans who enjoy clues, clever deductions and classic cases.",
  Weedflower: "A thoughtful choice for readers exploring historical fiction, identity and the strength of friendship.",
  "Artemis Fowl: The Arctic Incident": "Best for readers who enjoy witty heroes, magical technology and high-stakes fantasy quests.",
  "Little House in the Big Woods": "A timeless choice for readers who enjoy family stories, nature and everyday life in the past.",
  Stowaway: "A gripping choice for middle-grade readers who enjoy historical journeys and resilient young protagonists.",
  "The Savage Fortress": "Perfect for readers who enjoy mythology, demons, secret worlds and action-packed fantasy.",
  Stormbreaker: "A great fit for readers who enjoy espionage, gadgets, danger and teenage heroes.",
  "Maniac Magee": "A rewarding choice for readers who enjoy humour, heart and stories about belonging.",
  "Kira-Kira": "Best suited to readers who enjoy reflective family fiction and emotionally powerful coming-of-age stories.",
  "There's a Boy in the Girls' Bathroom": "A warm choice for readers who enjoy school stories, humour and characters who grow in unexpected ways.",
  "The Bad Beginning": "Ideal for readers who like gothic atmosphere, unusual humour and clever series openers.",
  "Diary of a Wimpy Kid: Party Pooper": "A quick, funny read for fans of illustrated comedy, family mishaps and school-age adventures.",
  "Bodyguard: Ransom": "A strong fit for teen readers who enjoy undercover missions, pursuit and suspense.",
  "Heart of a Samurai": "A compelling choice for readers who enjoy true-to-history adventures and stories of cultural discovery.",
  Ignite: "Best for readers who enjoy romantic fantasy, dangerous powers and difficult choices.",
  "Picture Perfect": "A good choice for readers who enjoy domestic suspense, emotional secrets and complicated relationships.",
  "Diary of a Wimpy Kid: Hot Mess": "Perfect for readers who want a light, comic read full of family chaos and embarrassing situations.",
  "The Last Kids on Earth and the Zombie Parade": "Ideal for readers who enjoy illustrated adventure, monster battles and irreverent humour.",
  "Sword Song": "A strong pick for adult readers who enjoy historical epics, warrior heroes and sweeping battles.",
  "It Ends with Us": "Recommended for readers drawn to emotionally direct contemporary fiction and complex relationship stories.",
  "The Da Vinci Code": "Best for readers who enjoy art history, hidden symbols, international travel and relentless suspense.",
  Becoming: "A thoughtful choice for memoir readers interested in family, public life, resilience and personal growth.",
  Origin: "A great fit for readers who enjoy science, art, conspiracies and globe-spanning thrillers.",
  "Myths & Legends": "A useful introduction for curious young readers discovering folklore, heroes and legendary creatures.",
  "Magical Stories": "Perfect for story time, independent reading and children who enjoy enchanted settings and classic-style tales.",
  "Harry Potter and the Half-Blood Prince": "A must-have for fantasy readers following Harry’s journey through friendship, mystery and rising darkness.",
  "The Boys from Biloxi": "A compelling choice for readers who enjoy legal drama, family ambition and long-running rivalries.",
  "Space Dumplins": "A fun fit for readers who enjoy graphic novels, colourful worlds, oddball humour and space adventure.",
  "Alex Rider: Eagle Strike": "Ideal for readers who enjoy secret agents, clever gadgets and international action.",
  "Vanishing Acts": "Best for readers who enjoy emotionally layered suspense, family secrets and difficult moral choices.",
  "Precious Gifts": "A warm choice for readers who enjoy family drama, romance and stories about forgiveness.",
  "Amulet: The Stonekeeper": "A standout choice for graphic-novel fans who enjoy epic fantasy, magical artefacts and family quests.",
  "A Tale of Magic...": "Perfect for readers who enjoy fairytale worlds, brave heroines and stories about justice.",
  "Goosebumps: Creepy Creatures": "A quick, accessible pick for young readers who enjoy spooky stories and illustrated scares.",
  "Bone: The Great Cow Race": "A great choice for graphic-novel readers who enjoy expressive art, comedy and fantasy adventure.",
  "Percy Jackson: The Throne of Fire": "Ideal for readers who enjoy mythology, sibling teamwork and action-packed quests.",
  "Percy Jackson: The Serpent's Shadow": "A satisfying choice for fans of mythological fantasy, humour and high-stakes finales.",
  "The Haunting of Gabriel Ashe": "Best for readers who enjoy eerie settings, supernatural mysteries and unsettling twists.",
  "Wings of Fire: Escaping Peril": "Perfect for dragon-fantasy fans who enjoy complex characters, adventure and questions of loyalty.",
};

for (const row of rows) {
  if (!copy[row.title]) throw new Error(`Missing improved copy for ${row.title}`);
  row.description = `${copy[row.title]} ${readerFit[row.title]}`;
}
await writeFile(dataPath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");

const sql = postgres(process.env.DATABASE_URL, { ssl: "require", prepare: false });
try {
  for (const row of rows) {
    const [product] = await sql`update products set description=${row.description}, updated_at=now() where slug=${row.slug} and deleted_at is null returning id`;
    if (!product) throw new Error(`Product not found: ${row.title}`);
    await sql`update products p set search_document=to_tsvector('simple',coalesce(p.name,'')||' '||coalesce(p.description,'')||' '||coalesce((select string_agg(a.alias,' ') from product_aliases a where a.product_id=p.id),'')||' '||coalesce((select string_agg(v.sku||' '||coalesce(v.barcode,''),' ') from product_variants v where v.product_id=p.id),'')) where p.id=${product.id}`;
  }
} finally {
  await sql.end();
}
console.log(`Updated ${rows.length} product descriptions and refreshed search.`);
