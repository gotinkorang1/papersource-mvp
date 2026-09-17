import type { Faq } from "./repository";

export function faqJsonLd(items: Array<Pick<Faq, "question" | "answer">>) {
  return { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: "en-GH", mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
}
