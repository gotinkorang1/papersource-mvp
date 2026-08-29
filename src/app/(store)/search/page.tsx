import { HeaderSearch } from "@/components/navigation/header-search";

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl text-ink">Search</h1>
      <p className="mt-3 text-slate">
        Search paper, toner, pens, brands or SKU. Full-text search lands with the
        catalogue.
      </p>
      <div className="mt-6">
        <HeaderSearch className="block w-full" />
      </div>
    </main>
  );
}
