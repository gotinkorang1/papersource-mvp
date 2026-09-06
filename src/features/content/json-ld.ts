import type { Faq } from "./repository";

export function faqJsonLd(items: Array<Pick<Faq, "question" | "answer">>) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
}
