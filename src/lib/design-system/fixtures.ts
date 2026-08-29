import { listProductCardsFromSeed } from "@/features/catalogue";
import { shopMegaColumns } from "@/features/catalogue/local-data";
import { listDivisionCategoriesFromSeed } from "@/features/catalogue/seed-queries";

/** Design-system samples. Catalogue pages read the same seed via features/catalogue. */
export const sampleProducts = listProductCardsFromSeed().slice(0, 4);

export const sampleCategories = listDivisionCategoriesFromSeed();

export { shopMegaColumns };
