/**
 * Ghana search-intent map. These are grouped by page intent so copy and
 * metadata can use a small, relevant subset instead of stuffing every term
 * into every page. The map contains 35 clusters x 10 phrases = 350 phrases.
 */
export const GHANA_KEYWORD_CLUSTERS = {
  office: ["office supplies Ghana", "office stationery Ghana", "office supplies Accra", "office stationery Accra", "office supplies online Ghana", "office stationery supplier Ghana", "workplace supplies Ghana", "business supplies Accra", "office essentials Ghana", "office supply shop Ghana"],
  a4Paper: ["A4 paper Ghana", "A4 paper Accra", "buy A4 paper online Ghana", "A4 copier paper Ghana", "photocopy paper Ghana", "printer paper Accra", "office paper supplier Ghana", "80gsm A4 paper Ghana", "A4 paper bulk Ghana", "cheap A4 paper Accra"],
  toner: ["printer toner Ghana", "toner cartridge Accra", "buy toner online Ghana", "printer ink Ghana", "ink cartridge Accra", "laser toner Ghana", "toner supplier Ghana", "HP toner Ghana", "Canon toner Accra", "Epson ink Ghana"],
  writing: ["pens Ghana", "ballpoint pens Accra", "buy pens online Ghana", "office pens Ghana", "school pencils Ghana", "markers Ghana", "highlighters Accra", "writing supplies Ghana", "gel pens Ghana", "bulk pens Accra"],
  filing: ["files and folders Ghana", "office filing supplies Accra", "lever arch files Ghana", "ring binders Accra", "document wallets Ghana", "archive boxes Ghana", "file folders online Ghana", "filing cabinet accessories Ghana", "office organisation supplies Ghana", "bulk files Accra"],
  desk: ["desk accessories Ghana", "office desk organiser Accra", "staplers Ghana", "office scissors Accra", "sticky notes Ghana", "desk supplies online Ghana", "office tape Ghana", "rulers and calculators Ghana", "desk organiser Ghana", "bulk desk supplies Accra"],
  school: ["school supplies Ghana", "school stationery Accra", "buy school supplies online Ghana", "classroom supplies Ghana", "school procurement Ghana", "exercise books Accra", "school bags and stationery Ghana", "student stationery Ghana", "school supply shop Accra", "bulk school supplies Ghana"],
  art: ["art supplies Ghana", "arts and crafts Accra", "school art materials Ghana", "craft supplies online Ghana", "drawing materials Ghana", "painting supplies Accra", "classroom art supplies Ghana", "colouring pencils Ghana", "creative supplies Accra", "bulk art supplies Ghana"],
  books: ["books Ghana", "buy books online Ghana", "books shop Accra", "children books Ghana", "educational books Accra", "school books Ghana", "fiction books Ghana", "books and novels Accra", "book supplier Ghana", "new books online Ghana"],
  notebooks: ["notebooks Ghana", "exercise books Ghana", "buy notebooks online Accra", "hard cover notebooks Ghana", "spiral notebooks Accra", "journals Ghana", "writing pads Ghana", "office notebooks Ghana", "school notebooks Accra", "bulk notebooks Ghana"],
  equipment: ["office equipment Ghana", "office equipment supplier Accra", "calculators Ghana", "shredders Accra", "laminators Ghana", "binding machines Ghana", "office technology Ghana", "office equipment online Ghana", "small office equipment Accra", "business equipment Ghana"],
  computer: ["computer accessories Ghana", "office electronics Accra", "USB drives Ghana", "keyboard and mouse Ghana", "computer cables Accra", "laptop accessories Ghana", "office tech accessories Ghana", "webcam Ghana", "storage devices Accra", "computer supplies online Ghana"],
  meeting: ["meeting room supplies Ghana", "conference supplies Accra", "whiteboards Ghana", "flip chart paper Ghana", "presentation supplies Accra", "office notice boards Ghana", "meeting stationery Ghana", "training materials Accra", "conference stationery Ghana", "corporate meeting supplies Ghana"],
  packaging: ["packaging supplies Ghana", "mailing supplies Accra", "envelopes Ghana", "shipping boxes Accra", "bubble wrap Ghana", "parcel supplies Ghana", "business envelopes Accra", "packaging materials online Ghana", "labels and stickers Ghana", "bulk packaging Accra"],
  printing: ["printing supplies Ghana", "office printing supplies Accra", "printer accessories Ghana", "photocopy supplies Ghana", "printing paper Accra", "printer consumables Ghana", "print supplies online Ghana", "office printer supplies Ghana", "copy paper supplier Accra", "bulk printing supplies Ghana"],
  procurement: ["office procurement Ghana", "stationery procurement Ghana", "corporate stationery supplier Ghana", "bulk office procurement Accra", "procurement supplies Ghana", "institutional stationery Ghana", "business stationery quotation Ghana", "office supply RFQ Ghana", "workplace procurement Accra", "approved stationery supplier Ghana"],
  bulk: ["bulk office supplies Ghana", "wholesale stationery Ghana", "bulk stationery Accra", "wholesale office supplies Accra", "office supplies in bulk Ghana", "bulk A4 paper Ghana", "bulk printer toner Ghana", "bulk school stationery Ghana", "corporate bulk orders Ghana", "stationery wholesale supplier Ghana"],
  corporate: ["corporate stationery Ghana", "office restocking Ghana", "business office supplies Accra", "company stationery supplier Ghana", "corporate procurement Accra", "office setup supplies Ghana", "new office supplies Ghana", "SME office supplies Ghana", "recurring office supplies Ghana", "workplace supply partner Ghana"],
  schools: ["school stationery supplier Ghana", "school supplies procurement Accra", "classroom stationery Ghana", "school office supplies Ghana", "university stationery supplier Ghana", "school bulk order Accra", "supplies for Ghanaian schools", "school supply quotation Ghana", "educational procurement Ghana", "school stationery delivery Ghana"],
  ngo: ["NGO office supplies Ghana", "NGO stationery supplier Accra", "development organisation supplies Ghana", "charity office supplies Ghana", "project stationery procurement Ghana", "donor project supplies Accra", "NGO bulk stationery Ghana", "nonprofit office supplies Ghana", "humanitarian office supplies Ghana", "NGO procurement supplier Ghana"],
  government: ["government stationery supplier Ghana", "public sector office supplies Ghana", "government procurement stationery Accra", "ministries office supplies Ghana", "public institution stationery Ghana", "government bulk supplies Accra", "tender stationery supplier Ghana", "government office equipment Ghana", "public school supplies Ghana", "institutional procurement Accra"],
  hospitality: ["hotel office supplies Ghana", "restaurant stationery Ghana", "hospitality supplies Accra", "hotel guest stationery Ghana", "hospital office supplies Ghana", "front desk supplies Accra", "hospitality procurement Ghana", "hotel printing supplies Ghana", "restaurant packaging supplies Ghana", "hospital bulk stationery Accra"],
  construction: ["construction office supplies Ghana", "site office stationery Ghana", "engineering office supplies Accra", "project office supplies Ghana", "contractor stationery supplier Ghana", "construction printing supplies Accra", "site document filing Ghana", "building project stationery Ghana", "contractor bulk supplies Ghana", "project procurement Accra"],
  legal: ["law office supplies Ghana", "accounting office supplies Accra", "professional office stationery Ghana", "legal filing supplies Ghana", "invoice books Accra", "receipt books Ghana", "business forms Ghana", "professional stationery supplier Ghana", "audit office supplies Accra", "company records supplies Ghana"],
  accraDelivery: ["stationery delivery Accra", "office supplies delivery Accra", "same day stationery Accra", "office supplies near me Accra", "A4 paper delivery Accra", "toner delivery Accra", "office supply shop Accra delivery", "business supplies delivered Accra", "stationery courier Accra", "office restock delivery Accra"],
  temaDelivery: ["stationery delivery Tema", "office supplies delivery Tema", "office supply shop Tema", "A4 paper delivery Tema", "toner delivery Tema", "business supplies Tema Ghana", "stationery supplier Tema", "bulk stationery delivery Tema", "workplace supplies Tema", "office restocking Tema"],
  nationwide: ["nationwide stationery delivery Ghana", "office supplies delivery Ghana", "buy stationery online Ghana delivery", "office supplies shipped Ghana", "stationery supplier nationwide Ghana", "A4 paper delivery Ghana", "toner delivery nationwide Ghana", "school supplies delivery Ghana", "bulk supplies delivery Ghana", "online office supplies Ghana"],
  pickup: ["stationery shop pickup Accra", "office supplies pickup Ghana", "click and collect Accra stationery", "pick up A4 paper Accra", "shop pickup Asylum Down", "shop pickup Kanda Accra", "order online collect Accra", "stationery collection point Accra", "office supplies click collect Ghana", "PaperSource shop pickup"],
  value: ["affordable office supplies Ghana", "best stationery prices Ghana", "office supplies price Ghana", "A4 paper price Ghana", "toner price Accra", "cheap office stationery Ghana", "stationery deals Accra", "office supplies comparison Ghana", "value office supplies Ghana", "quality stationery affordable Ghana"],
  brands: ["stationery brands Ghana", "office brands Accra", "HP supplies Ghana", "Canon supplies Ghana", "Double A paper Ghana", "Oxford notebooks Ghana", "BIC pens Ghana", "Pilot pens Ghana", "Maped stationery Ghana", "trusted stationery brands Ghana"],
  tonerCompatibility: ["HP printer toner compatibility Ghana", "Canon toner cartridge guide Ghana", "Epson ink compatibility Ghana", "find toner for printer Ghana", "printer cartridge model Ghana", "toner replacement Accra", "compatible ink cartridge Ghana", "laser printer toner guide Ghana", "printer consumables compatibility", "buy correct toner Ghana"],
  paperSpecs: ["paper GSM explained Ghana", "A4 paper sizes Ghana", "A3 paper Ghana", "A5 paper Ghana", "cardstock Ghana", "coloured paper Accra", "copy paper GSM Ghana", "paper size guide Ghana", "printer paper thickness Ghana", "best paper for office printing Ghana"],
  ghanaModifiers: ["shop in Ghana online", "Ghana online shopping stationery", "Accra office shop", "Greater Accra stationery", "Ghana business supplies", "Ghana workplace essentials", "local stationery supplier Ghana", "Ghana office products", "Ghana school supplies shop", "Ghana stationery catalogue"],
  questions: ["where to buy office supplies in Ghana", "where to buy A4 paper in Accra", "where to buy printer toner in Ghana", "what stationery does a new office need", "how to order bulk stationery Ghana", "how much is A4 paper in Ghana", "does PaperSource deliver in Accra", "can I pick up stationery in Accra", "what paper GSM is best for printing", "how to choose printer toner Ghana"],
  trustAndService: ["PaperSource Ghana reviews", "reliable stationery supplier Accra", "trusted office supplies Ghana", "office supplies customer service Ghana", "stationery returns Ghana", "office supply delivery tracking Ghana", "VAT inclusive stationery Ghana", "secure stationery checkout Ghana", "business account stationery Ghana", "shop stationery with Paystack Ghana"],
} as const;

export const GHANA_SEO_KEYWORDS = Object.values(GHANA_KEYWORD_CLUSTERS).flat();
export const TOP_GHANA_KEYWORDS = [
  ...GHANA_KEYWORD_CLUSTERS.office.slice(0, 4),
  ...GHANA_KEYWORD_CLUSTERS.a4Paper.slice(0, 3),
  ...GHANA_KEYWORD_CLUSTERS.toner.slice(0, 3),
  ...GHANA_KEYWORD_CLUSTERS.procurement.slice(0, 3),
  ...GHANA_KEYWORD_CLUSTERS.accraDelivery.slice(0, 3),
];

const CATEGORY_CLUSTERS: Record<string, keyof typeof GHANA_KEYWORD_CLUSTERS> = {
  paper: "a4Paper", "paper-printing": "a4Paper", printing: "printing", "office-equipment": "equipment", technology: "computer",
  writing: "writing", "writing-marking": "writing", filing: "filing", "filing-organisation": "filing", "desk-essentials": "desk", "desk-accessories": "desk",
  "school-supplies": "school", "arts-crafts": "art", "books-notebooks": "notebooks", books: "books", workplace: "corporate", "general-supplies": "office",
};

export function keywordsForCategory(slug: string, name: string) {
  const cluster = GHANA_KEYWORD_CLUSTERS[CATEGORY_CLUSTERS[slug] ?? "office"];
  return [...cluster, `${name} Ghana`, `${name} Accra`, `${name} supplier Ghana`];
}

export function keywordsForProduct(input: { name: string; brandName: string; categoryName?: string; specLine?: string }) {
  const category = input.categoryName?.toLowerCase() ?? "";
  const cluster = category.includes("paper") ? GHANA_KEYWORD_CLUSTERS.a4Paper : category.includes("toner") || category.includes("print") ? GHANA_KEYWORD_CLUSTERS.toner : GHANA_KEYWORD_CLUSTERS.office;
  return [...cluster.slice(0, 6), input.name, input.brandName, input.categoryName ?? "office supplies", input.specLine ?? "", `${input.name} Ghana`, `buy ${input.name} online Ghana`].filter(Boolean);
}
