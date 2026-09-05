import type { Metadata } from "next";
import Image from "next/image";
import { PaperCard } from "@/components/commerce/paper-card";

export const metadata: Metadata = {
  title: "About PaperSource",
  description:
    "Learn about PaperSource, a NiiPlants Group Ghana Limited subsidiary helping Ghanaian workplaces source supplies simply.",
};

const beliefs = [
  ["Make sourcing simple", "Clear products, practical guidance and a straightforward path to buy or request a quote."],
  ["Be dependable", "Accurate communication, honest availability and delivery information customers can plan around."],
  ["Serve the whole workplace", "From a single pack to a recurring procurement list, every customer deserves responsive support."],
] as const;

export default function AboutPage() {
  return (
    <main>
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
    </main>
  );
}
