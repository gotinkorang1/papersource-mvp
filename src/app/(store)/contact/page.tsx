import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { absoluteUrl, BUSINESS_MAP_URL, BUSINESS_PHONE_NUMBERS, LOCAL_BUSINESS_NAME, pageMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact PaperSource",
  description: "Contact PaperSource - Asylum Down in Ghana by phone, email or at our Kanda and Asylum Down location.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "@id": `${absoluteUrl("/contact")}#contact-page`,
            url: absoluteUrl("/contact"),
            name: "Contact PaperSource Ghana",
            isPartOf: { "@id": `${SITE_URL}/#website` },
            mainEntity: {
              "@type": "LocalBusiness",
              "@id": `${SITE_URL}/#local-business`,
              name: LOCAL_BUSINESS_NAME,
              email: "info@papersourcegh.com",
              telephone: BUSINESS_PHONE_NUMBERS[0],
              hasMap: BUSINESS_MAP_URL,
              areaServed: ["Accra", "Tema", "Ghana"],
              address: {
                "@type": "PostalAddress",
                addressLocality: "Accra",
                addressRegion: "Greater Accra",
                addressCountry: "GH",
              },
              contactPoint: BUSINESS_PHONE_NUMBERS.map((telephone) => ({
                "@type": "ContactPoint",
                telephone,
                email: "info@papersourcegh.com",
                contactType: "customer service",
                areaServed: "GH",
                availableLanguage: "en",
              })),
            },
          }),
        }}
      />
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <p className="text-sm tracking-[0.16em] text-slate uppercase">Contact PaperSource</p>
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-ink md:text-5xl">Let&apos;s make your next order easier.</h1>
          <p className="mt-5 text-lg text-slate">Our team can help with product questions, bulk requirements, delivery and quotations.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-paper-green">Phone</p><p className="mt-2 flex flex-wrap gap-x-3 gap-y-1">{BUSINESS_PHONE_NUMBERS.map((phone, index) => <a key={phone} href={`tel:${phone}`} className="font-medium text-ink underline underline-offset-2">{index === 0 ? "0555 001 313" : "0552 767 156"}</a>)}</p></div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-paper-green">Email</p><a href="mailto:info@papersourcegh.com" className="mt-2 inline-block font-medium text-ink underline underline-offset-2">info@papersourcegh.com</a></div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:col-span-2 lg:col-span-1"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-paper-green">Visit us</p><p className="mt-2 text-slate">Kanda · Asylum Down</p></div>
          </div>
          <div className="mt-10 flex flex-wrap gap-3"><Link href="/request-quote" className="inline-flex min-h-11 items-center rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink/90">Request a Quote</Link><Link href="/shop" className="inline-flex min-h-11 items-center rounded-md border border-ink px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-cream">Shop products</Link></div>
        </div>
        <div className="relative min-h-80 overflow-hidden rounded-xl border border-border bg-cream shadow-[0_20px_50px_rgba(16,42,67,0.1)] lg:min-h-full"><Image src="/images/aerial-view-african-descent-woman-working-computer-white-table-office.jpg" alt="Workplace desk with stationery and computer" fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /></div>
      </div>
      <section className="mt-12 grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-stretch" aria-labelledby="asylum-down-location-heading">
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <p className="text-sm tracking-[0.16em] text-slate uppercase">Visit us</p>
          <h2 id="asylum-down-location-heading" className="mt-3 text-2xl text-ink">{LOCAL_BUSINESS_NAME}</h2>
          <p className="mt-3 text-slate">Find our Asylum Down location on the map. Call ahead for product availability, collection guidance or delivery support.</p>
          <a href={BUSINESS_MAP_URL} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center rounded-md border border-ink px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-cream">Open in Google Maps</a>
        </div>
        <div className="min-h-80 overflow-hidden rounded-xl border border-border bg-cream shadow-sm sm:min-h-96">
          <iframe
            title="PaperSource Asylum Down location map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.98125274776!2d-0.2047095!3d5.5697889!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9b003df3187f%3A0x9d54c07ffed30ba4!2sPaperSource%20-%20Asylum%20Down!5e0!3m2!1sen!2sca!4v1789627844257!5m2!1sen!2sca"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: "20rem" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </section>
    </main>
  );
}
