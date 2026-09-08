import type { Metadata } from "next";
import Image from "next/image";
import { PaperCard } from "@/components/commerce/paper-card";
import { pageMetadata, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About PaperSource",
  description:
    "Learn about PaperSource, a NiiPlants Group Ghana Limited subsidiary helping Ghanaian workplaces source supplies simply.",
  path: "/about",
});

const beliefs = [
  ["Make sourcing simple", "Clear products, practical guidance and a straightforward path to buy or request a quote."],
  ["Be dependable", "Accurate communication, honest availability and delivery information customers can plan around."],
  ["Serve the whole workplace", "From a single pack to a recurring procurement list, every customer deserves responsive support."],
] as const;

const managementTeam = [
  ["Theophilus Ayitey-Adjin", "Founder and Proprietor", "An engineer and entrepreneur focused on building dependable, practical supply businesses for Ghanaian customers."],
  ["Frank Adjei", "Fleet Manager", "A fleet and transport management professional who leads vehicle availability, maintenance, safety and operational reliability across the Group."],
  ["Wilhemina Adoma Opoku", "Human Resource and Administration Manager", "A Chartered HR professional who guides talent, employee experience, policy, learning and organisational effectiveness."],
  ["Mr. Awotwe-Pratt", "General Manager, Nii Plants and Car Rentals", "A finance and operations leader with more than 20 years of experience across accounting, business development, customer accounts and operations."],
  ["Kingdom Kededor Avisseh", "Executive Assistant and General Manager, Trivoxo", "A logistics and supply-chain professional supporting client engagement, partnerships and operational excellence across the Group."],
] as const;

const clientele = ["ABB", "Zenith", "Vitol", "USAID", "University of Ghana", "Saladin Ghana", "Promasidor", "Oloam", "MTN", "FAO", "DEME (Dredging International)", "Bosch", "Latex Foam", "Project Management International"] as const;

export default function AboutPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "AboutPage",
        url: `${SITE_URL}/about`,
        name: "About PaperSource Ghana",
        mainEntity: { "@type": "Organization", name: "PaperSource Ghana", parentOrganization: { "@type": "Organization", name: "NiiPlants Group Ghana Limited" } },
      }) }} />
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8">
        <div>
          <p className="text-sm tracking-[0.16em] text-slate uppercase">About PaperSource</p>
          <h1 className="mt-4 max-w-3xl text-4xl text-ink md:text-6xl">Workplace supplies, thoughtfully sourced.</h1>
          <p className="mt-6 max-w-2xl text-lg text-slate">PaperSource helps offices, schools, businesses and homes find the everyday paper, stationery, printing supplies and workplace essentials they need.</p>
          <p className="mt-4 max-w-2xl text-slate">We are a subsidiary of <strong className="font-medium text-ink">NiiPlants Group Ghana Limited</strong>, building a dependable supply experience for customers across Ghana.</p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-cream shadow-[0_20px_50px_rgba(16,42,67,0.12)]">
          <Image src="/images/young-african-business-woman-standing-grey-wall.jpg" alt="Professional at work in a modern office" fill sizes="(max-width: 1024px) 100vw, 46vw" className="object-cover" />
        </div>
      </section>

      <section className="border-y border-border bg-card py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm tracking-[0.16em] text-slate uppercase">What we believe</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {beliefs.map(([title, body]) => <PaperCard key={title} className="p-6"><h2 className="text-xl text-ink">{title}</h2><p className="mt-3 text-sm leading-relaxed text-slate">{body}</p></PaperCard>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm tracking-[0.16em] text-slate uppercase">Management profile</p>
          <h2 className="mt-3 text-3xl text-ink md:text-4xl">Practical leadership, close to the customer.</h2>
          <p className="mt-5 text-slate">PaperSource is managed as a customer-focused operating business within NiiPlants Group Ghana Limited. Our management approach brings together catalogue discipline, procurement experience and a bias toward clear follow-through.</p>
          <p className="mt-4 text-slate">That means listening carefully to what a customer needs, separating retail orders from bulk quotations, and coordinating supply and delivery with the right level of detail. We are building for long-term relationships with individuals, schools, offices and organisations.</p>
        </div>
      </section>

      <section className="border-y border-border bg-cream/60 py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm tracking-[0.16em] text-slate uppercase">Our customers</p>
          <h2 className="mt-3 max-w-3xl text-3xl text-ink md:text-4xl">Trusted by teams that keep Ghana moving.</h2>
          <p className="mt-4 max-w-2xl text-slate">We support organisations across technology, education, manufacturing, development, finance and operations with responsive workplace supply.</p>
          <ul className="mt-8 flex flex-wrap gap-3" aria-label="Selected clientele">
            {clientele.map((name) => <li key={name} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-ink">{name}</li>)}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm tracking-[0.16em] text-slate uppercase">Management team</p>
          <h2 className="mt-3 text-3xl text-ink md:text-4xl">Experienced people behind the supply experience.</h2>
          <p className="mt-4 text-slate">PaperSource is supported by a practical management team within NiiPlants Group Ghana Limited. Each leader brings a distinct discipline to the customer experience, from people and fleet operations to finance, logistics and growth.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {managementTeam.map(([name, role, bio]) => <PaperCard key={name} className="p-6"><h3 className="text-lg text-ink">{name}</h3><p className="mt-1 text-sm font-medium text-teal">{role}</p><p className="mt-4 text-sm leading-relaxed text-slate">{bio}</p></PaperCard>)}
        </div>
      </section>
    </main>
  );
}
