export const FALLBACK_FAQS = [
  ["Can I buy as a guest?", "Yes. Guest checkout and guest quotation requests are supported. Creating an account adds order history, saved Ghana addresses and organisation tools."],
  ["What is the difference between Cart and Quote?", "Cart is for published-price retail checkout. Quote is for bulk, quote-only or procurement requests. They are separate lists."],
  ["Where do you deliver?", "Direct delivery is available across Accra and Tema. Nationwide delivery can be arranged on request."],
  ["How do quotations work?", "Submit your requirements and contact details. Our team reviews the list, confirms pricing and delivery, and sends a quotation."],
  ["How can I pay?", "Published-price retail orders can use available Paystack card and Mobile Money options."],
  ["How do I contact the team?", "Email info@papersourcegh.com or call 0555 001 313 / 0552 767 156. Our locations are Kanda and Asylum Down."],
] as const;

export const FALLBACK_NAVIGATION = {
  header: [{ label: "Shop", href: "/shop" }, { label: "About", href: "/about" }, { label: "Contact", href: "/contact" }],
  footer: [{ label: "Shop products", href: "/shop" }, { label: "About us", href: "/about" }, { label: "Delivery", href: "/delivery" }, { label: "FAQs", href: "/faq" }],
  mobile: [{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: "Search", href: "/search" }, { label: "Quote", href: "/quote" }, { label: "Cart", href: "/cart" }],
} as const;
