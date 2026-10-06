import { cloudinaryImageUrl } from "@/lib/cloudinary";
import type { CatalogueCategoryView } from "@/types/catalogue";

const categoryImages: Record<string, { src: string; alt: string }> = {
  paper: { src: "/images/close-up-view-back-school-concept.jpg", alt: "Paper, notebooks and colourful stationery" },
  "copier-paper": { src: "/images/catalogue-stationery-generated.png", alt: "Copier paper and office stationery" },
  "coloured-paper": { src: "/images/top-view-colorful-pencils-wih-copy-space.jpg", alt: "Colourful paper and creative stationery" },
  cardstock: { src: "/images/physical-paper-book-background-closeup.jpg", alt: "Presentation cardstock and paper stock" },
  labels: { src: "/images/making-design-notes.jpg", alt: "Labels and organised desk notes" },
  "sticky-notes": { src: "/images/education-concept-with-pencils-pen-scissors-notebook-eraser-paper.jpg", alt: "Sticky notes and desk stationery" },
  writing: { src: "/images/extreme-close-up-pen-taken-by-person-from-desk-organizer.jpg", alt: "Pens arranged in a desk organiser" },
  pens: { src: "/images/3d-render-various-fountain-pens.jpg", alt: "Ballpoint and fountain pens" },
  pencils: { src: "/images/pencils-cup-white-table.jpg", alt: "Pencils in a desk cup" },
  markers: { src: "/images/cheerful-teen-holding-big-pencil.jpg", alt: "Creative marker and drawing supplies" },
  highlighters: { src: "/images/young-teenage-girl-lying-her-bed-studying-light-bedroom-home.jpg", alt: "Highlighters and study stationery" },
  correction: { src: "/images/boy-holding-white-paper-school.jpg", alt: "Correction and school writing supplies" },
  filing: { src: "/images/ring-binder-used-stored-documents.jpg", alt: "Ring binder holding organised documents" },
  files: { src: "/images/stack-books-with-library-scene.jpg", alt: "Files and organised office records" },
  folders: { src: "/images/front-view-pile-books-with-mug.jpg", alt: "Folders for papers and presentations" },
  binders: { src: "/images/aerial-view-african-descent-woman-working-computer-white-table-office.jpg", alt: "Office binder and document organisation" },
  "document-wallets": { src: "/images/lightbox-still-life-arrangement.jpg", alt: "Document wallets and desk organisation" },
  "archive-boxes": { src: "/images/still-life-documents-stack.jpg", alt: "Archive boxes and stored documents" },
  "desk-essentials": { src: "/images/set-school-stationery.jpg", alt: "Everyday desk essentials arranged neatly" },
  printing: { src: "/images/home-printer-based-toner.jpg", alt: "Home printer and printing supplies" },
  "ink-cartridges": { src: "/images/home-printer-based-toner (1).jpg", alt: "Printer ink cartridges and supplies" },
  toners: { src: "/images/speaking-client.jpg", alt: "Office printer toner for everyday printing" },
  "printer-accessories": { src: "/images/black-businessman-sad-expression.jpg", alt: "Printer accessories for office equipment" },
  technology: { src: "/images/female-graphic-designer-writing-diary.jpg", alt: "Creative professional working with office technology" },
  "school-supplies": { src: "/images/school-stationery-with-accessories.jpg", alt: "School stationery and learning accessories" },
  workplace: { src: "/images/pleased-satisfied-black-male-holds-many-books-hands-looks-positively-dressed-formal-shirt.jpg", alt: "Workplace documents and office supplies" },
};

const categoryImageFallback = "/images/catalogue-stationery-generated.png";

export function categoryImageFor(category: Pick<CatalogueCategoryView, "slug" | "name" | "imagePublicId">) {
  const uploaded = category.imagePublicId ? cloudinaryImageUrl(category.imagePublicId, 1000) : null;
  if (uploaded) return { src: uploaded, alt: `${category.name} workplace supplies` };
  const key = `${category.slug} ${category.name}`.toLowerCase();
  return Object.entries(categoryImages).find(([alias]) => key.includes(alias))?.[1] ?? {
    src: categoryImageFallback,
    alt: `${category.name} workplace supplies`,
  };
}

export { categoryImageFallback };
