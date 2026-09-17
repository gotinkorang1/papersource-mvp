type CategoryCopyInput = { slug: string; name: string; caption?: string | null };

const CATEGORY_INTROS: Record<string, string> = {
  paper: "Shop copier paper, coloured paper, cardstock and everyday paper products for offices, schools and home projects in Ghana.",
  writing: "Find dependable pens, pencils, markers, highlighters and correction products for classrooms, desks and professional workspaces.",
  filing: "Keep documents organised with files, folders, binders, document wallets and archive solutions for Ghanaian workplaces and schools.",
  "desk-essentials": "Stock the everyday desk essentials teams rely on, including staplers, tape, scissors, rulers and practical office tools.",
  printing: "Shop ink, toner and printer accessories for home, office and school printing, with product compatibility details where available.",
  technology: "Browse practical office technology and accessories that help teams connect, organise and work efficiently.",
  "school-supplies": "Find books, geometry sets, art materials and writing supplies for Ghanaian learners, classrooms and school procurement lists.",
  workplace: "Explore workplace essentials for shared offices, meeting rooms, storage areas and everyday business operations.",
};

export function categorySeoDescription(category: CategoryCopyInput) {
  return CATEGORY_INTROS[category.slug] ?? `Shop ${category.name.toLowerCase()} from PaperSource Ghana. ${category.caption?.trim() || "Browse practical stationery and workplace supplies for Accra, Tema and nationwide supply on request."}`;
}
