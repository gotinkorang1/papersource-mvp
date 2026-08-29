import { FeaturedCatalogue } from "@/components/products/featured-catalogue";

export default function ShopPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl text-ink">Shop</h1>
      <p className="mt-3 max-w-2xl text-slate">
        Sample products for the design system. Add to Cart and Add to Quote are
        independent.
      </p>
      <div className="mt-10">
        <FeaturedCatalogue />
      </div>
    </main>
  );
}
