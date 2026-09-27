import type { Metadata } from "next";
import Link from "next/link";
import { FALLBACK_FAQS, faqJsonLd, listPublishedFaqs } from "@/features/content";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Stationery, delivery and quote FAQs", description: "Answers about PaperSource products, Ghana delivery zones, shop pickup, quotations, checkout, payment and returns.", path: "/faq", keywords: ["stationery delivery FAQ Ghana", "shop pickup Accra", "bulk stationery quote Ghana"] });

export default async function FaqPage() {
  const managed = await listPublishedFaqs();
  const items = managed.length ? managed.map(({ question, answer }) => ({ question, answer })) : FALLBACK_FAQS.map(([question, answer]) => ({ question, answer }));
  const staff = await readStaffActor();
  const canEdit = Boolean(staff && managed.length && canAccessAdmin(staff.role, "faqs", "write"));
  return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-16 lg:px-8"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(items)) }} /><div className="max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-paper-green">FAQ</p><h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-ink md:text-6xl">Answers before you order.</h1><p className="mt-4 text-lg leading-8 text-slate">Quick guidance on products, delivery, payment, quotations, returns and shop pickup.</p></div><div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card px-5 shadow-sm sm:px-8">{items.map(({ question, answer }, index) => <details key={question} open={index === 0} className="group py-5"><summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-heading text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden"><span>{question}</span><span aria-hidden className="mt-0.5 text-xl font-normal text-paper-green transition-transform group-open:rotate-45">+</span></summary><div className="mt-3 flex flex-wrap items-start justify-between gap-3"><p className="max-w-2xl text-sm leading-7 text-slate">{answer}</p>{canEdit && managed[index] ? <Link href="/admin/faqs" className="text-xs font-semibold text-ink underline underline-offset-2">Edit FAQ</Link> : null}</div></details>)}</div><p className="mt-8 text-slate">Still have a question? <Link href="/contact" className="font-medium text-ink underline">Contact us</Link>.</p></main>;
}
