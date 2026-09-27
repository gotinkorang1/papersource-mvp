import { cloudinaryImageUrl } from "@/lib/cloudinary";
import type { CatalogueCategoryView } from "@/types/catalogue";

const categoryImages: Record<string, { src: string; alt: string }> = {
  paper: { src: "/images/close-up-view-back-school-concept.jpg", alt: "Paper, notebooks and colourful stationery" },
  writing: { src: "/images/extreme-close-up-pen-taken-by-person-from-desk-organizer.jpg", alt: "Pens arranged in a desk organiser" },
  filing: { src: "/images/ring-binder-used-stored-documents.jpg", alt: "Ring binder holding organised documents" },
  "desk-essentials": { src: "/images/lightbox-still-life-arrangement.jpg", alt: "Everyday desk essentials arranged neatly" },
  printing: { src: "/images/home-printer-based-toner.jpg", alt: "Home printer and printing supplies" },
  technology: { src: "/images/female-graphic-designer-writing-diary.jpg", alt: "Creative professional working with office technology" },
  "school-supplies": { src: "/images/school-stationery-with-accessories.jpg", alt: "School stationery and learning accessories" },
  workplace: { src: "/images/still-life-documents-stack.jpg", alt: "Workplace documents and office supplies" },
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
