import { Quote } from "lucide-react";

const testimonials = [
  { quote: "PaperSource keeps our office stocked without the usual back-and-forth. The quote path makes approvals simple.", name: "Operations lead", company: "Accra professional services firm" },
  { quote: "We can order everyday stationery quickly and still get help when a school term needs a larger supply plan.", name: "School administrator", company: "Accra independent school" },
  { quote: "The team understands that procurement is about reliability, not just products. They follow through.", name: "Office manager", company: "Ghanaian trading company" },
];

export function Testimonials() {
  return (
    <section className="border-y border-border bg-cream/60 py-16 md:py-20" aria-labelledby="customer-stories">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm tracking-[0.16em] text-slate uppercase">Trusted in the workday</p><h2 id="customer-stories" className="mt-3 max-w-xl text-3xl text-ink md:text-4xl">A dependable supply partner, not another tab to manage.</h2></div>
          <p className="max-w-xs text-sm text-slate">Thoughtful service for teams, schools and growing businesses across Ghana.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((entry) => <figure key={entry.company} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"><Quote className="size-6 text-ochre" aria-hidden /><blockquote className="mt-5 text-lg leading-relaxed text-ink">“{entry.quote}”</blockquote><figcaption className="mt-6 border-t border-border pt-4 text-sm"><p className="font-semibold text-ink">{entry.name}</p><p className="mt-1 text-slate">{entry.company}</p></figcaption></figure>)}
        </div>
      </div>
    </section>
  );
}
