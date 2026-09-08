import type { Metadata } from "next";
import Link from "next/link";
import { FALLBACK_FAQS, faqJsonLd, listPublishedFaqs } from "@/features/content";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Stationery, delivery and quote FAQs", description: "Answers about PaperSource products, Ghana delivery zones, quotations, checkout, payment and returns.", path: "/faq" });

export default async function FaqPage() {
  const managed = await listPublishedFaqs();
  const items = managed.length ? managed.map(({ question, answer }) => ({ question, answer })) : FALLBACK_FAQS.map(([question, answer]) => ({ question, answer }));
  const staff = await readStaffActor();
  const canEdit = Boolean(staff && managed.length && canAccessAdmin(staff.role, "faqs", "write"));
  return <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 md:py-20 lg:px-8"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(items)) }} /><p className="text-sm tracking-[0.16em] text-slate uppercase">FAQ</p><h1 className="mt-4 text-4xl text-ink md:text-5xl">Answers before you order.</h1><div className="mt-10 divide-y divide-border rounded-lg border border-border bg-card px-6">{items.map(({ question, answer }, index) => <section key={question} className="py-6"><div className="flex flex-wrap items-start justify-between gap-3"><h2 className="text-lg font-medium text-ink">{question}</h2>{canEdit && managed[index] ? <Link href="/admin/faqs" className="text-xs font-semibold text-ink underline underline-offset-2">Edit FAQ</Link> : null}</div><p className="mt-2 text-sm leading-relaxed text-slate">{answer}</p></section>)}</div><p className="mt-8 text-slate">Still have a question? <Link href="/contact" className="text-ink underline">Contact us</Link>.</p></main>;
}
