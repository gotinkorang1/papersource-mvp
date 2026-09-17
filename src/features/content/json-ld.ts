import type { Faq } from "./repository";
import { SITE_URL } from "@/lib/seo";

export function faqJsonLd(items: Array<Pick<Faq, "question" | "answer">>, url = `${SITE_URL}/faq`) {
  return { "@context": "https://schema.org", "@type": "FAQPage", "@id": `${url}#faq`, url, inLanguage: "en-GH", mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
}
