import type { Metadata } from "next";
import { BulkPriceTable } from "@/components/commerce/bulk-price-table";
import { DeliveryBadge } from "@/components/commerce/delivery-badge";
import { GhanaAddressForm } from "@/components/commerce/ghana-address-form";
import { PaperButton } from "@/components/commerce/paper-button";
import { PaperCard } from "@/components/commerce/paper-card";
import { PriceDisplay } from "@/components/commerce/price-display";
import { OrderTimeline, QuoteTimeline } from "@/components/commerce/timelines";
import { BrandLogo } from "@/components/marketing/brand-logo";
import { OfficeBundleCard } from "@/components/products/office-bundle-card";
import { ProductCard } from "@/components/products/product-card";
import { ProductGallery } from "@/components/products/product-gallery";
import { QuoteSummary } from "@/components/quotes/quote-summary";
import { StockBadge } from "@/components/commerce/stock-badge";
import { sampleProducts } from "@/lib/design-system/fixtures";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  const sample = sampleProducts[0];

  return (
    <main className="mx-auto max-w-6xl space-y-16 px-4 py-16">
      <header>
        <p className="text-sm tracking-[0.16em] text-slate uppercase">
          Internal
        </p>
        <h1 className="mt-2 text-4xl text-ink">Design system</h1>
        <p className="mt-3 max-w-2xl text-slate">
          PaperSource primitives before the live catalogue. Not indexed.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl text-ink">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <PaperButton>Primary</PaperButton>
          <PaperButton variant="secondary">Secondary</PaperButton>
          <PaperButton variant="quote">Quote</PaperButton>
          <PaperButton variant="accent">Accent</PaperButton>
          <PaperButton variant="ghost">Ghost</PaperButton>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl text-ink">Product card</h2>
        <div className="max-w-md">
          <ProductCard product={sample} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl text-ink">Price, stock, delivery</h2>
        <PaperCard className="max-w-sm space-y-3 p-5">
          <PriceDisplay pesewas={7800} unitLabel="ream" />
          <BulkPriceTable tiers={sample.tiers} unitLabel="ream" />
          <StockBadge level="in_stock" />
          <DeliveryBadge
            zone={{
              label: "Accra & Tema delivery available",
              feeMode: "calculated",
            }}
          />
        </PaperCard>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl text-ink">Gallery, brands, packs</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <ProductGallery alt="Sample A4 paper pack" />
          <div className="space-y-4">
            <div className="flex gap-6 border border-border bg-card px-5 py-4">
              <BrandLogo name="HP" />
              <BrandLogo name="Canon" />
              <BrandLogo name="Double A" />
            </div>
            <OfficeBundleCard
              name="New Employee Starter Pack"
              contents={[
                "Notebook",
                "2 pens",
                "Pencil",
                "Highlighter",
                "Sticky notes",
                "File folder",
              ]}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl text-ink">Quote</h2>
          <div className="mt-4 space-y-4">
            <QuoteSummary
              number="PSQ-2026-000238"
              status="sent"
              grandTotalPesewas={1_245_000}
              expiresAt="11 Sep 2026"
            />
            <QuoteTimeline status="sent" />
          </div>
        </div>
        <div>
          <h2 className="text-xl text-ink">Order</h2>
          <div className="mt-4">
            <OrderTimeline status="processing" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl text-ink">Ghana address</h2>
        <div className="mt-4 max-w-xl">
          <GhanaAddressForm />
        </div>
      </section>
    </main>
  );
}
