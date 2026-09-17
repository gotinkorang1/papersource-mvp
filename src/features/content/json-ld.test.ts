import { describe, expect, it } from "vitest";
import { faqJsonLd } from "./json-ld";

describe("faqJsonLd", () => {
  it("identifies FAQ content as Ghana English", () => {
    expect(faqJsonLd([{ question: "Do you deliver?", answer: "Yes." }])).toMatchObject({
      "@type": "FAQPage",
      inLanguage: "en-GH",
    });
  });
});
