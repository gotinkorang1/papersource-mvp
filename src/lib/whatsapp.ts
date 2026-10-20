/** Public PaperSource WhatsApp line, used until staff set one in store settings. */
export const DEFAULT_WHATSAPP_NUMBER = "+233555001313";

/** wa.me expects the international number as digits only, without "+" or spaces. */
export function whatsappDigits(number: string | null | undefined): string {
  const digits = (number ?? "").replace(/\D/g, "");
  return digits.length >= 8 ? digits : DEFAULT_WHATSAPP_NUMBER.replace(/\D/g, "");
}

export function whatsappChatLink(number: string | null | undefined, message?: string): string {
  const base = `https://wa.me/${whatsappDigits(number)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function productEnquiryMessage(input: { name: string; sku: string; url: string }): string {
  return [
    "Hello PaperSource, I'd like to ask about this product:",
    `${input.name} (SKU ${input.sku})`,
    input.url,
    "",
    "Quantity needed: ",
  ].join("\n");
}

export function quoteListMessage(lines: { name: string; sku: string; quantity: number; unitLabel?: string }[]): string {
  return [
    "Hello PaperSource, please quote for the following items:",
    "",
    ...lines.map((line, index) => `${index + 1}. ${line.name} (SKU ${line.sku}) x ${line.quantity}${line.unitLabel ? ` ${line.unitLabel}` : ""}`),
    "",
    "Organisation: ",
    "Delivery location: ",
  ].join("\n");
}
