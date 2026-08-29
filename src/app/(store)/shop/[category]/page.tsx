import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGridList } from "@/components/products/product-grid-list";
import { getCategoryBySlug, listProductCards } from "@/features/catalogue";

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

  return {
    title: `${category.name} for Ghana workplaces`,
    description: `${category.caption}. Delivered across Accra and Tema. Nationwide supply on request.`,
  };
}

export default async function ShopCategoryPage({ params }: PageProps) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await listProductCards({ categorySlug: slug });

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-sm text-slate">
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        <span aria-hidden> / </span>
        {category.name}
      </p>
      <h1 className="mt-4 text-3xl text-ink">{category.name}</h1>
      <p className="mt-3 max-w-2xl text-slate">{category.caption}</p>
      <div className="mt-10">
        <ProductGridList products={products} />
      </div>
    </main>
  );
}
