import { listDivisionCategories, listProductCards } from "@/features/catalogue";
import { shopMegaColumns } from "@/features/catalogue/local-data";

/** Design-system samples. Catalogue pages read the same seed via features/catalogue. */
export const sampleProducts = listProductCards().slice(0, 4);

export const sampleCategories = listDivisionCategories();

export { shopMegaColumns };
