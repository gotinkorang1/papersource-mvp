import { Quote, Star } from "lucide-react";

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
          {testimonials.map((entry) => <figure key={entry.company} className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-[transform,box-shadow] duration-300 hover:shadow-lg motion-safe:hover:-translate-y-1 sm:p-6">
            <div className="flex items-center justify-between gap-4"><span className="grid size-10 place-items-center rounded-xl bg-ochre/10 text-ochre"><Quote className="size-5" aria-hidden /></span><span className="flex gap-0.5 text-ochre" aria-hidden><Star className="size-3.5 fill-current" /><Star className="size-3.5 fill-current" /><Star className="size-3.5 fill-current" /><Star className="size-3.5 fill-current" /><Star className="size-3.5 fill-current" /></span></div>
            <blockquote className="mt-5 flex-1 text-base leading-7 text-ink sm:text-lg">“{entry.quote}”</blockquote>
            <figcaption className="mt-6 border-t border-border pt-4 text-sm"><p className="font-semibold text-ink">{entry.name}</p><p className="mt-1 text-slate">{entry.company}</p></figcaption>
          </figure>)}
        </div>
      </div>
    </section>
  );
}
