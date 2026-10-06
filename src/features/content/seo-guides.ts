import { absoluteUrl } from "@/lib/seo";

export type SeoGuideLink = { label: string; href: string };
export type SeoGuide = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
  links: SeoGuideLink[];
};

export const SEO_GUIDES_UPDATED_AT = "2026-10-06";

// These guides are deliberately practical and location-specific. They are
// static so crawlers can discover them without a database request or a CMS
// session, while catalogue links keep the content useful to shoppers.
export const SEO_GUIDES: SeoGuide[] = [
  {
    slug: "best-a4-paper-for-ghana-offices",
    title: "Best A4 paper for Ghana offices",
    description: "A practical guide to choosing A4 copier paper for offices in Accra, Tema and across Ghana.",
    intro: "The right A4 paper helps reports, invoices and everyday office printing run smoothly. Start with the paper weight, brightness, pack size and printer compatibility your team actually uses.",
    sections: [
      { heading: "Choose the right paper specification", paragraphs: ["For everyday black-and-white documents, standard office copier paper is usually the most practical choice. Check the ream size and GSM on the pack, then match it to your printer or copier guide.", "For presentations, certificates and client-facing documents, a smoother or heavier stock can give a more polished finish. Test one pack before committing to a larger procurement order."] },
      { heading: "Plan a reliable office supply", paragraphs: ["Keep a small working buffer and reorder before the last ream. For multi-branch or recurring requirements, use PaperSource’s quote path so quantities and delivery needs can be reviewed together."] },
    ],
    links: [{ label: "Shop paper and printing supplies", href: "/shop/paper-printing" }, { label: "Request a bulk quote", href: "/request-quote" }],
  },
  {
    slug: "how-to-choose-printer-toner-in-accra",
    title: "How to choose printer toner in Accra",
    description: "Use this checklist to identify compatible printer toner and avoid costly wrong-cartridge purchases in Accra.",
    intro: "Printer toner is model-specific. Before ordering, record the printer brand, exact model number and the cartridge code printed on the old cartridge or printer menu.",
    sections: [
      { heading: "Check compatibility first", paragraphs: ["Do not rely on a broad printer family name alone. Compare the cartridge code and printer model, and confirm whether the cartridge is black, colour, standard-yield or high-yield.", "If you are unsure, include the printer model in a quote request. This gives a procurement team enough information to confirm the match before supply."] },
      { heading: "Buy for the real workload", paragraphs: ["High-volume offices may benefit from a higher-yield cartridge when the printer supports it. Smaller teams can prioritise a reliable standard-yield option and keep one approved spare on hand."] },
    ],
    links: [{ label: "Browse printer supplies", href: "/shop/paper-printing" }, { label: "Contact PaperSource", href: "/contact" }],
  },
  {
    slug: "office-stationery-checklist-for-a-new-business",
    title: "Office stationery checklist for a new business",
    description: "A Ghana-focused starter checklist for setting up a new office with paper, writing, filing and desk essentials.",
    intro: "A new office does not need every stationery item on day one. Prioritise the tools people use for communication, record keeping, printing and daily organisation.",
    sections: [
      { heading: "Start with the essentials", paragraphs: ["Plan A4 paper, pens, notebooks, staplers, staples, tape, scissors, folders, files, envelopes and labels. Add printer consumables only after checking the exact printer models in the office.", "Create a simple shared stock list with an owner, reorder point and preferred specification. This reduces duplicate purchases and last-minute shopping."] },
      { heading: "Make procurement easier", paragraphs: ["For a new team, group the list by workspace, shared store and role-based starter pack. PaperSource can review larger lists through the quote basket before you place an order."] },
    ],
    links: [{ label: "Shop workplace essentials", href: "/shop/workplace" }, { label: "Shop filing and organisation", href: "/shop/filing" }, { label: "Request a quote", href: "/request-quote" }],
  },
  {
    slug: "school-stationery-list-for-ghanaian-classrooms",
    title: "School stationery list for Ghanaian classrooms",
    description: "A practical classroom stationery list for schools, teachers and education teams sourcing supplies in Ghana.",
    intro: "Classroom needs vary by year group and subject, but a clear core list makes school procurement more predictable and easier to budget.",
    sections: [
      { heading: "Core classroom supplies", paragraphs: ["Plan exercise and drawing books, pencils, pens, erasers, rulers, sharpeners, coloured pencils, markers, paper and folders. Teachers may also need board markers, correction supplies and storage labels.", "Separate learner packs from shared classroom stock. Label bulk cartons by class or department before delivery to make distribution faster."] },
      { heading: "Plan ahead for term starts", paragraphs: ["Request quantities early enough to allow substitutions when a particular brand or pack is unavailable. A quote lets the school compare quantities, delivery requirements and approved alternatives in one conversation."] },
    ],
    links: [{ label: "Shop school supplies", href: "/shop/school-supplies" }, { label: "Explore writing supplies", href: "/shop/writing" }, { label: "Get a school quote", href: "/request-quote" }],
  },
  {
    slug: "bulk-stationery-procurement-guide",
    title: "Bulk stationery procurement guide for Ghana organisations",
    description: "A step-by-step guide for planning bulk office and school stationery orders in Ghana.",
    intro: "Bulk procurement works best when specifications, quantities, delivery requirements and approval limits are clear before a supplier prepares pricing.",
    sections: [
      { heading: "Build a procurement-ready list", paragraphs: ["Include product name, preferred brand where relevant, size or GSM, pack size, quantity, delivery destination and required date. Note approved alternatives instead of leaving substitutions unclear.", "Separate recurring items such as paper and toner from one-off purchases such as files, boards or starter packs. This creates a useful baseline for future reorders."] },
      { heading: "Use the quote basket for larger orders", paragraphs: ["PaperSource’s quote basket keeps bulk requests separate from retail checkout. Add the products, submit the organisation details and let the team review availability and delivery requirements."] },
    ],
    links: [{ label: "Start a bulk quote", href: "/request-quote" }, { label: "Shop all products", href: "/shop" }, { label: "Business supply options", href: "/business" }],
  },
  {
    slug: "accra-tema-and-nationwide-delivery-guide",
    title: "Accra, Tema and nationwide delivery guide",
    description: "Understand PaperSource delivery options for Accra, Tema and other Ghana destinations before checkout.",
    intro: "Delivery availability and timing depend on the destination, product availability and order details. Confirm the delivery area at checkout before placing a retail order.",
    sections: [
      { heading: "Accra and Tema orders", paragraphs: ["Select the delivery area that matches the destination and provide a reachable phone number. The team may use it to confirm directions or coordinate delivery details.", "For larger or time-sensitive orders, request a quote so the destination and quantities can be reviewed before payment."] },
      { heading: "Other regions", paragraphs: ["Nationwide supply can be arranged on request. Include the town, region, contact person and preferred timing in your request so the delivery plan can be assessed accurately."] },
    ],
    links: [{ label: "Read delivery information", href: "/delivery" }, { label: "Shop products", href: "/shop" }, { label: "Contact the team", href: "/contact" }],
  },
  {
    slug: "shop-pickup-guide",
    title: "Shop pickup guide for PaperSource customers",
    description: "How to choose shop pickup, place an order and collect stationery from PaperSource in Asylum Down.",
    intro: "Shop pickup is available as an alternative to delivery when it suits your schedule. Choose pickup at checkout, then wait for confirmation that the order is ready before travelling to the shop.",
    sections: [
      { heading: "How pickup works", paragraphs: ["Add products to your retail cart, choose the shop pickup option at checkout and provide a reachable phone number. PaperSource will prepare the order and share collection guidance when it is ready.", "Do not assume an order is ready immediately after payment. Keep the order reference available when you arrive for collection."] },
      { heading: "For business and school orders", paragraphs: ["Use the quote path for larger quantities or planned procurement. Pickup requirements can be discussed with the quote so the collection plan matches the order size."] },
    ],
    links: [{ label: "Read delivery and pickup details", href: "/delivery" }, { label: "Shop now", href: "/shop" }, { label: "Request a quote", href: "/request-quote" }],
  },
  {
    slug: "paper-sizes-and-gsm-explained",
    title: "Paper sizes and GSM explained",
    description: "A simple guide to A4, A3 and GSM so Ghana shoppers can choose paper confidently.",
    intro: "Paper size describes the sheet dimensions. GSM describes the paper weight. Both matter when you are selecting paper for printers, documents, crafts or presentations.",
    sections: [
      { heading: "Common sizes", paragraphs: ["A4 is the everyday office size used for letters, reports and forms. A3 is larger and useful for posters, plans, diagrams and wider layouts. Check your printer’s supported sizes before ordering.", "Specialist sizes and formats may be available for labels, cards or presentation work. Use the product specification rather than guessing from a photograph."] },
      { heading: "What GSM tells you", paragraphs: ["A lower GSM is often practical for everyday copying and drafts. A higher GSM generally feels heavier and can suit covers, certificates or presentation pages, subject to printer compatibility.", "If the paper is for a school or office print room, test a sample through the actual printer before committing to a large quantity."] },
    ],
    links: [{ label: "Shop paper and printing", href: "/shop/paper-printing" }, { label: "Browse school supplies", href: "/shop/school-supplies" }, { label: "Ask for help", href: "/contact" }],
  },
];

export const SEO_GUIDE_SLUGS = SEO_GUIDES.map((guide) => guide.slug);

export function getSeoGuide(slug: string) {
  return SEO_GUIDES.find((guide) => guide.slug === slug) ?? null;
}

export function seoGuideUrl(slug: string) {
  return absoluteUrl(`/guides/${slug}`);
}
