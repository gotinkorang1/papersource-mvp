import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGridList } from "@/components/products/product-grid-list";
import { getBrandBySlug, listProductCards } from "@/features/catalogue";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    return { title: "Brand" };
  }

  return {
    title: `${brand.name} supplies in Ghana`,
    description: `${brand.name} workplace supplies from PaperSource. Accra and Tema delivery.`,
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  const products = await listProductCards({ brandSlug: slug });

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl text-ink">{brand.name}</h1>
      <p className="mt-3 max-w-2xl text-slate">
        {brand.name} products in the PaperSource catalogue.
      </p>
      <div className="mt-10">
        <ProductGridList products={products} />
      </div>
    </main>
  );
}
