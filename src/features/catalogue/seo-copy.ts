type CategoryCopyInput = { slug: string; name: string; caption?: string | null };

const CATEGORY_INTROS: Record<string, string> = {
  paper: "Shop copier paper, coloured paper, cardstock and everyday paper products for offices, schools and home projects in Ghana.",
  "paper-printing": "Shop A4 copier paper, coloured paper, cardstock, ink, toner and printer supplies for Ghanaian offices, schools and home printing.",
  writing: "Find dependable pens, pencils, markers, highlighters and correction products for classrooms, desks and professional workspaces.",
  "writing-marking": "Find pens, pencils, markers, highlighters and correction supplies for Ghanaian classrooms, offices and professional workspaces.",
  filing: "Keep documents organised with files, folders, binders, document wallets and archive solutions for Ghanaian workplaces and schools.",
  "filing-organisation": "Keep Ghanaian office and school documents organised with files, folders, binders, wallets and practical archive solutions.",
  "desk-essentials": "Stock the everyday desk essentials teams rely on, including staplers, tape, scissors, rulers and practical office tools.",
  "desk-accessories": "Stock desk organisers, staplers, tape, scissors, rulers and everyday accessories for focused Ghanaian workspaces.",
  printing: "Shop ink, toner and printer accessories for home, office and school printing, with product compatibility details where available.",
  "office-equipment": "Browse practical office equipment and technology accessories that help Ghanaian teams connect, organise and work efficiently.",
  technology: "Browse practical office technology and accessories that help teams connect, organise and work efficiently.",
  "school-supplies": "Find books, geometry sets, art materials and writing supplies for Ghanaian learners, classrooms and school procurement lists.",
  "arts-crafts": "Find art, craft and creative classroom materials for Ghanaian schools, learners, offices and hands-on projects.",
  "books-notebooks": "Browse books, notebooks and journals for study, planning, record keeping and creative learning in Ghana.",
  "general-supplies": "Explore dependable office, school and home essentials available for quick order or bulk quotation across Ghana.",
  workplace: "Explore workplace essentials for shared offices, meeting rooms, storage areas and everyday business operations.",
};

export function categorySeoDescription(category: CategoryCopyInput) {
  return CATEGORY_INTROS[category.slug] ?? `Shop ${category.name.toLowerCase()} from PaperSource Ghana. ${category.caption?.trim() || "Browse practical stationery and workplace supplies for Accra, Tema and nationwide supply on request."}`;
}
