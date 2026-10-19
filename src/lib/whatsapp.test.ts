import { describe, expect, it } from "vitest";
import { productEnquiryMessage, whatsappChatLink, whatsappDigits } from "./whatsapp";

describe("whatsapp links", () => {
  it("normalises international numbers to digits", () => {
    expect(whatsappDigits("+233 20 123 4567")).toBe("233201234567");
  });

  it("falls back to the public PaperSource line when unset or invalid", () => {
    expect(whatsappDigits(null)).toBe("233555001313");
    expect(whatsappDigits("abc")).toBe("233555001313");
  });

  it("encodes a prefilled product enquiry", () => {
    const message = productEnquiryMessage({ name: "A4 Paper & Co", sku: "PS-1", url: "https://papersourcegh.com/product/a4" });
    const link = whatsappChatLink("+233201234567", message);
    expect(link.startsWith("https://wa.me/233201234567?text=")).toBe(true);
    expect(decodeURIComponent(link.split("text=")[1])).toBe(message);
    expect(message).toContain("A4 Paper & Co (SKU PS-1)");
  });
});

describe("quoteListMessage", () => {
  it("lists every quote line with SKU and quantity", async () => {
    const { quoteListMessage } = await import("./whatsapp");
    const message = quoteListMessage([
      { name: "A4 Paper", sku: "PS-A4", quantity: 10, unitLabel: "ream" },
      { name: "Stapler", sku: "PS-ST", quantity: 2 },
    ]);
    expect(message).toContain("1. A4 Paper (SKU PS-A4) x 10 ream");
    expect(message).toContain("2. Stapler (SKU PS-ST) x 2");
  });
});
