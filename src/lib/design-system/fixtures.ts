import type { ProductCardModel } from "@/types/catalogue";

/** Design-system sample data only. Not a catalogue backend. */
export const sampleProducts: ProductCardModel[] = [
  {
    id: "double-a-a4",
    slug: "double-a-premium-a4",
    name: "Double A Premium A4 Paper",
    specLine: "A4 • 80gsm • 500 sheets",
    unitLabel: "ream",
    unitPricePesewas: 7800,
    imageAlt: "Double A Premium A4 paper, 80gsm, 500 sheets",
    stock: "in_stock",
    tiers: [
      {
        minimumQuantity: 10,
        maximumQuantity: 49,
        unitPricePesewas: 7450,
        requestQuote: false,
      },
      {
        minimumQuantity: 50,
        maximumQuantity: null,
        unitPricePesewas: null,
        requestQuote: true,
      },
    ],
  },
  {
    id: "hp-305-blk",
    slug: "hp-305-black",
    name: "HP 305 Black Ink Cartridge",
    specLine: "OEM • ~200 pages • DeskJet 2700",
    unitLabel: "each",
    unitPricePesewas: 18500,
    imageAlt: "HP 305 black ink cartridge for DeskJet 2700 series",
    stock: "low",
    tiers: [
      {
        minimumQuantity: 5,
        maximumQuantity: null,
        unitPricePesewas: 17600,
        requestQuote: false,
      },
    ],
  },
  {
    id: "bic-blue-50",
    slug: "bic-cristal-blue-50",
    name: "BIC Cristal Blue Pens",
    specLine: "Blue • 1.0mm • pack of 50",
    unitLabel: "pack",
    unitPricePesewas: 4200,
    imageAlt: "BIC Cristal blue ballpoint pens, pack of 50",
    stock: "in_stock",
    tiers: [
      {
        minimumQuantity: 10,
        maximumQuantity: null,
        unitPricePesewas: 3900,
        requestQuote: false,
      },
    ],
  },
  {
    id: "lever-arch-a4",
    slug: "a4-lever-arch-file",
    name: "A4 Lever Arch File",
    specLine: "A4 • board • 75mm spine",
    unitLabel: "each",
    unitPricePesewas: 2800,
    imageAlt: "A4 lever arch file, 75mm spine",
    stock: "out",
    tiers: [
      {
        minimumQuantity: 20,
        maximumQuantity: null,
        unitPricePesewas: null,
        requestQuote: true,
      },
    ],
  },
];

export const sampleCategories = [
  { name: "Paper", href: "/shop", caption: "Copier, coloured, cardstock" },
  { name: "Writing", href: "/shop", caption: "Pens, markers, correction" },
  { name: "Filing", href: "/shop", caption: "Files, folders, archive" },
  { name: "Printing", href: "/shop", caption: "Ink, toner, accessories" },
  { name: "Desk Essentials", href: "/shop", caption: "Staplers, tape, scissors" },
  { name: "Technology", href: "/shop", caption: "Keyboards, drives, boards" },
  { name: "School Supplies", href: "/shop", caption: "Books, geometry, art" },
  { name: "Workplace", href: "/shop", caption: "Boards, storage, batteries" },
] as const;

export const shopMegaColumns = [
  {
    title: "Paper & writing",
    links: [
      { label: "Paper", href: "/shop" },
      { label: "Writing", href: "/shop" },
      { label: "Desk", href: "/shop" },
      { label: "Schools", href: "/schools" },
    ],
  },
  {
    title: "Print & organise",
    links: [
      { label: "Printing", href: "/shop" },
      { label: "Filing", href: "/shop" },
      { label: "Technology", href: "/shop" },
      { label: "Workplace", href: "/shop" },
    ],
  },
] as const;
