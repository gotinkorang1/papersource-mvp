import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ProductGridList } from "@/components/products/product-grid-list";
import { getCategoryBySlug, listProductCards } from "@/features/catalogue";
import { pageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return { title: "Category" };
  }

  return pageMetadata({
    title: `${category.name} for Ghana workplaces`,
    description: `${category.caption}. Delivered across Accra and Tema. Nationwide supply on request.`,
    path: `/shop/${category.slug}`,
  });
}

export default async function ShopCategoryPage({ params }: PageProps) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await listProductCards({ categorySlug: category.slug });
  const categoryImage: Record<string, { src: string; alt: string }> = {
    paper: { src: "/images/close-up-view-back-school-concept.jpg", alt: "Paper and colourful stationery" },
    writing: { src: "/images/extreme-close-up-pen-taken-by-person-from-desk-organizer.jpg", alt: "Pens arranged in a desk organiser" },
    filing: { src: "/images/ring-binder-used-stored-documents.jpg", alt: "Ring binder holding organised documents" },
    "desk-essentials": { src: "/images/lightbox-still-life-arrangement.jpg", alt: "Everyday desk essentials" },
    printing: { src: "/images/home-printer-based-toner.jpg", alt: "Printer and printing supplies" },
    technology: { src: "/images/female-graphic-designer-writing-diary.jpg", alt: "Professional using workplace technology" },
    "school-supplies": { src: "/images/school-stationery-with-accessories.jpg", alt: "School stationery and learning accessories" },
    workplace: { src: "/images/still-life-documents-stack.jpg", alt: "Workplace documents and supplies" },
  };
  const image = categoryImage[category.slug] ?? categoryImage.workplace;

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <Breadcrumbs items={[{ label: "Shop", href: "/shop" }, { label: category.name }]} />
      <div className="mt-4 grid items-center gap-6 md:grid-cols-[1fr_16rem]">
        <div><h1 className="text-3xl text-ink md:text-4xl">{category.name}</h1><p className="mt-3 max-w-2xl text-slate">{category.caption}</p></div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-cream shadow-sm"><Image src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 100vw, 16rem" className="object-cover" /></div>
      </div>
      <div className="mt-10">
        <ProductGridList products={products} />
      </div>
    </main>
  );
}
