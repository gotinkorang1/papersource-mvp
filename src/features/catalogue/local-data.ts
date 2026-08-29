import type { PriceTierInput } from "@/features/catalogue/pricing";

export type SeedCategory = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  caption: string;
  position: number;
};

export type SeedBrand = {
  id: string;
  name: string;
  slug: string;
};

export type SeedAttribute = {
  namespace: string;
  key: string;
  valueText: string;
};

export type SeedProduct = {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  productType: "standard" | "bundle";
  description: string;
  attributes: SeedAttribute[];
  aliases: string[];
  sku: string;
  barcode: string | null;
  unitLabel: string;
  baseUnitPricePesewas: number;
  tiers: PriceTierInput[];
  onHand: number;
  reserved: number;
  lowStockThreshold: number;
  imageAlt: string;
  bundleContents?: string[];
};

export const seedCategories: SeedCategory[] = [
  { id: "paper", parentId: null, name: "Paper", slug: "paper", caption: "Copier, coloured, cardstock", position: 1 },
  { id: "writing", parentId: null, name: "Writing", slug: "writing", caption: "Pens, markers, correction", position: 2 },
  { id: "filing", parentId: null, name: "Filing & Organisation", slug: "filing", caption: "Files, folders, archive", position: 3 },
  { id: "desk-essentials", parentId: null, name: "Desk Essentials", slug: "desk-essentials", caption: "Staplers, tape, scissors", position: 4 },
  { id: "printing", parentId: null, name: "Printing", slug: "printing", caption: "Ink, toner, accessories", position: 5 },
  { id: "technology", parentId: null, name: "Office Technology", slug: "technology", caption: "Keyboards, drives, boards", position: 6 },
  { id: "school-supplies", parentId: null, name: "School Supplies", slug: "school-supplies", caption: "Books, geometry, art", position: 7 },
  { id: "workplace", parentId: null, name: "Workplace Essentials", slug: "workplace", caption: "Boards, storage, batteries", position: 8 },
  { id: "copier-paper", parentId: "paper", name: "Copier Paper", slug: "copier-paper", caption: "A4 and A3 copier reams", position: 11 },
  { id: "coloured-paper", parentId: "paper", name: "Coloured Paper", slug: "coloured-paper", caption: "Tints and cardstock colours", position: 12 },
  { id: "cardstock", parentId: "paper", name: "Cardstock", slug: "cardstock", caption: "Cover and presentation stock", position: 13 },
  { id: "labels", parentId: "paper", name: "Labels", slug: "labels", caption: "Address and file labels", position: 14 },
  { id: "sticky-notes", parentId: "paper", name: "Sticky Notes", slug: "sticky-notes", caption: "Pads and flags", position: 15 },
  { id: "pens", parentId: "writing", name: "Pens", slug: "pens", caption: "Ballpoint and gel", position: 21 },
  { id: "pencils", parentId: "writing", name: "Pencils", slug: "pencils", caption: "Graphite and mechanical", position: 22 },
  { id: "markers", parentId: "writing", name: "Markers", slug: "markers", caption: "White board and permanent", position: 23 },
  { id: "highlighters", parentId: "writing", name: "Highlighters", slug: "highlighters", caption: "Desk and wallet packs", position: 24 },
  { id: "correction", parentId: "writing", name: "Correction Products", slug: "correction", caption: "Tape and fluid", position: 25 },
  { id: "files", parentId: "filing", name: "Files", slug: "files", caption: "Lever arch and box files", position: 31 },
  { id: "folders", parentId: "filing", name: "Folders", slug: "folders", caption: "Manila and presentation", position: 32 },
  { id: "binders", parentId: "filing", name: "Binders", slug: "binders", caption: "Ring binders", position: 33 },
  { id: "document-wallets", parentId: "filing", name: "Document Wallets", slug: "document-wallets", caption: "Wallets and pockets", position: 34 },
  { id: "archive-boxes", parentId: "filing", name: "Archive Boxes", slug: "archive-boxes", caption: "Storage cartons", position: 35 },
  { id: "ink-cartridges", parentId: "printing", name: "Ink Cartridges", slug: "ink-cartridges", caption: "Desktop inkjet", position: 51 },
  { id: "toners", parentId: "printing", name: "Toners", slug: "toners", caption: "Laser toner", position: 52 },
  { id: "printer-accessories", parentId: "printing", name: "Printer Accessories", slug: "printer-accessories", caption: "Drums and kits", position: 53 },
];

export const seedBrands: SeedBrand[] = [
  { id: "double-a", name: "Double A", slug: "double-a" },
  { id: "hp", name: "HP", slug: "hp" },
  { id: "bic", name: "BIC", slug: "bic" },
  { id: "canon", name: "Canon", slug: "canon" },
  { id: "papersource", name: "PaperSource", slug: "papersource" },
];

export const seedProducts: SeedProduct[] = [
  {
    id: "double-a-a4",
    name: "Double A Premium A4 Paper",
    slug: "double-a-premium-a4",
    brandId: "double-a",
    categoryId: "copier-paper",
    productType: "standard",
    description:
      "80gsm A4 copier paper for Accra and Tema offices. Sold by the ream. Bulk desks and print rooms should request a quotation from 50 reams.",
    attributes: [
      { namespace: "paper", key: "size", valueText: "A4" },
      { namespace: "paper", key: "gsm", valueText: "80gsm" },
      { namespace: "paper", key: "sheets", valueText: "500 sheets" },
    ],
    aliases: ["A4 80gsm", "Double A A4", "copier paper Ghana"],
    sku: "DA-A4-80-500",
    barcode: "8851234560011",
    unitLabel: "ream",
    baseUnitPricePesewas: 7800,
    tiers: [
      { minimumQuantity: 10, maximumQuantity: 49, unitPricePesewas: 7450, requestQuote: false },
      { minimumQuantity: 50, maximumQuantity: null, unitPricePesewas: null, requestQuote: true },
    ],
    onHand: 240,
    reserved: 0,
    lowStockThreshold: 20,
    imageAlt: "Double A Premium A4 paper, 80gsm, 500 sheets",
  },
  {
    id: "hp-305-blk",
    name: "HP 305 Black Ink Cartridge",
    slug: "hp-305-black",
    brandId: "hp",
    categoryId: "ink-cartridges",
    productType: "standard",
    description:
      "OEM HP 305 black ink for DeskJet 2700 series. Keep a spare on the desk; five-plus cartridges drop to the bulk unit price.",
    attributes: [
      { namespace: "toner", key: "oem", valueText: "OEM" },
      { namespace: "toner", key: "yield", valueText: "~200 pages" },
      { namespace: "toner", key: "compatible_models", valueText: "DeskJet 2700" },
    ],
    aliases: ["HP 305 black", "HP 305", "DeskJet 2700 ink"],
    sku: "HP-305-BLK",
    barcode: "0195132123058",
    unitLabel: "each",
    baseUnitPricePesewas: 18500,
    tiers: [
      { minimumQuantity: 5, maximumQuantity: null, unitPricePesewas: 17600, requestQuote: false },
    ],
    onHand: 4,
    reserved: 0,
    lowStockThreshold: 5,
    imageAlt: "HP 305 black ink cartridge for DeskJet 2700 series",
  },
  {
    id: "bic-blue-50",
    name: "BIC Cristal Blue Pens",
    slug: "bic-cristal-blue-50",
    brandId: "bic",
    categoryId: "pens",
    productType: "standard",
    description:
      "Blue 1.0mm BIC Cristal ballpoints in a box of 50. Standard issue for Ghanaian classrooms and reception desks.",
    attributes: [
      { namespace: "pen", key: "ink_colour", valueText: "Blue" },
      { namespace: "pen", key: "tip_size", valueText: "1.0mm" },
      { namespace: "pen", key: "pack_quantity", valueText: "pack of 50" },
    ],
    aliases: ["BIC Cristal", "blue pens pack 50"],
    sku: "BIC-CRIS-BLU-50",
    barcode: "3086126100014",
    unitLabel: "pack",
    baseUnitPricePesewas: 4200,
    tiers: [
      { minimumQuantity: 10, maximumQuantity: null, unitPricePesewas: 3900, requestQuote: false },
    ],
    onHand: 80,
    reserved: 0,
    lowStockThreshold: 10,
    imageAlt: "BIC Cristal blue ballpoint pens, pack of 50",
  },
  {
    id: "lever-arch-a4",
    name: "A4 Lever Arch File",
    slug: "a4-lever-arch-file",
    brandId: "papersource",
    categoryId: "files",
    productType: "standard",
    description:
      "Board A4 lever arch with a 75mm spine. Currently awaiting replenishment; twenty-plus files are quotation only.",
    attributes: [
      { namespace: "file", key: "size", valueText: "A4" },
      { namespace: "file", key: "material", valueText: "board" },
      { namespace: "file", key: "capacity", valueText: "75mm spine" },
    ],
    aliases: ["lever arch", "A4 file"],
    sku: "PS-LA-A4-75",
    barcode: null,
    unitLabel: "each",
    baseUnitPricePesewas: 2800,
    tiers: [
      { minimumQuantity: 20, maximumQuantity: null, unitPricePesewas: null, requestQuote: true },
    ],
    onHand: 0,
    reserved: 0,
    lowStockThreshold: 12,
    imageAlt: "A4 lever arch file, 75mm spine",
  },
  {
    id: "new-employee-pack",
    name: "New Employee Starter Pack",
    slug: "new-employee-starter-pack",
    brandId: "papersource",
    categoryId: "workplace",
    productType: "bundle",
    description:
      "Desk kit for a new hire: notebook, pens, pencil, highlighter, sticky notes and a file folder. Add to cart for one desk or quote for a cohort.",
    attributes: [{ namespace: "bundle", key: "type", valueText: "New hire desk kit" }],
    aliases: ["starter pack", "new employee", "onboarding stationery"],
    sku: "PS-BDL-NEWHIRE",
    barcode: null,
    unitLabel: "pack",
    baseUnitPricePesewas: 12500,
    tiers: [
      { minimumQuantity: 10, maximumQuantity: null, unitPricePesewas: 11500, requestQuote: false },
    ],
    onHand: 36,
    reserved: 0,
    lowStockThreshold: 6,
    imageAlt: "New employee starter pack of workplace stationery",
    bundleContents: [
      "Notebook",
      "2 pens",
      "Pencil",
      "Highlighter",
      "Sticky notes",
      "File folder",
    ],
  },
  {
    id: "small-office-pack",
    name: "Small Office Starter Pack",
    slug: "small-office-starter-pack",
    brandId: "papersource",
    categoryId: "workplace",
    productType: "bundle",
    description:
      "A first-order pack for a new Accra or Tema office: paper, pens, files and desk basics. Request a quote above ten packs.",
    attributes: [{ namespace: "bundle", key: "type", valueText: "Small office setup" }],
    aliases: ["office setup", "small office pack"],
    sku: "PS-BDL-SMLOFF",
    barcode: null,
    unitLabel: "pack",
    baseUnitPricePesewas: 48500,
    tiers: [
      { minimumQuantity: 10, maximumQuantity: null, unitPricePesewas: null, requestQuote: true },
    ],
    onHand: 18,
    reserved: 0,
    lowStockThreshold: 4,
    imageAlt: "Small office starter pack of paper, pens and files",
    bundleContents: [
      "10 reams A4 paper",
      "2 packs of pens",
      "4 lever arch files",
      "Stapler and tape",
      "Sticky notes",
    ],
  },
  {
    id: "classroom-pack",
    name: "Classroom Pack",
    slug: "classroom-pack",
    brandId: "papersource",
    categoryId: "school-supplies",
    productType: "bundle",
    description:
      "Teacher-ready classroom stationery for Ghanaian schools. Class sets are quoted; a single pack can go through retail checkout.",
    attributes: [{ namespace: "bundle", key: "type", valueText: "Classroom set" }],
    aliases: ["school pack", "classroom stationery"],
    sku: "PS-BDL-CLASS",
    barcode: null,
    unitLabel: "pack",
    baseUnitPricePesewas: 22000,
    tiers: [
      { minimumQuantity: 20, maximumQuantity: null, unitPricePesewas: null, requestQuote: true },
    ],
    onHand: 22,
    reserved: 0,
    lowStockThreshold: 5,
    imageAlt: "Classroom stationery pack for Ghanaian schools",
    bundleContents: [
      "Exercise books",
      "Pens and pencils",
      "Geometry set",
      "Markers",
      "A4 paper ream",
    ],
  },
];

export const seedDeliveryZones = [
  { code: "accra_central", name: "Accra Central", region: "Greater Accra", basePrice: 2500, feeMode: "calculated" as const, sortOrder: 1 },
  { code: "accra_east", name: "Accra East", region: "Greater Accra", basePrice: 2500, feeMode: "calculated" as const, sortOrder: 2 },
  { code: "accra_west", name: "Accra West", region: "Greater Accra", basePrice: 2500, feeMode: "calculated" as const, sortOrder: 3 },
  { code: "accra_north", name: "Accra North", region: "Greater Accra", basePrice: 2800, feeMode: "calculated" as const, sortOrder: 4 },
  { code: "tema", name: "Tema", region: "Greater Accra", basePrice: 3000, feeMode: "calculated" as const, sortOrder: 5 },
  { code: "tema_industrial", name: "Tema Industrial Area", region: "Greater Accra", basePrice: 3200, feeMode: "calculated" as const, sortOrder: 6 },
  { code: "other_greater_accra", name: "Other Greater Accra", region: "Greater Accra", basePrice: 4000, feeMode: "calculated" as const, sortOrder: 7 },
  { code: "nationwide_request", name: "Nationwide Request", region: "Nationwide", basePrice: 0, feeMode: "on_request" as const, sortOrder: 8 },
];

export const shopMegaColumns = [
  {
    title: "Paper & writing",
    links: [
      { label: "Paper", href: "/shop/paper" },
      { label: "Writing", href: "/shop/writing" },
      { label: "Desk", href: "/shop/desk-essentials" },
      { label: "Schools", href: "/shop/school-supplies" },
    ],
  },
  {
    title: "Print & organise",
    links: [
      { label: "Printing", href: "/shop/printing" },
      { label: "Filing", href: "/shop/filing" },
      { label: "Technology", href: "/shop/technology" },
      { label: "Workplace", href: "/shop/workplace" },
    ],
  },
] as const;
