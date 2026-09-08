import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PaperSource Ghana",
    short_name: "PaperSource",
    description: "Workplace supplies, simply sourced across Ghana.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "portrait-primary",
    background_color: "#f8f6f1",
    theme_color: "#102a43",
    lang: "en-GH",
    categories: ["business", "shopping"],
    prefer_related_applications: false,
    screenshots: [
      { src: "/images/catalogue-stationery-generated.png", sizes: "1200x900", type: "image/png", form_factor: "wide", label: "PaperSource workplace supplies catalogue" },
      { src: "/images/catalogue-stationery-generated.png", sizes: "1200x900", type: "image/png", form_factor: "narrow", label: "PaperSource mobile shopping experience" },
    ],
    shortcuts: [
      { name: "Shop products", short_name: "Shop", description: "Browse workplace supplies", url: "/shop", icons: [{ src: "/icons/papersource-192.svg", sizes: "192x192", type: "image/svg+xml" }] },
      { name: "Search catalogue", short_name: "Search", description: "Find a product quickly", url: "/search", icons: [{ src: "/icons/papersource-192.svg", sizes: "192x192", type: "image/svg+xml" }] },
      { name: "Request a quote", short_name: "Quote", description: "Build a bulk quote", url: "/quote", icons: [{ src: "/icons/papersource-192.svg", sizes: "192x192", type: "image/svg+xml" }] },
      { name: "Open cart", short_name: "Cart", description: "Review your cart", url: "/cart", icons: [{ src: "/icons/papersource-192.svg", sizes: "192x192", type: "image/svg+xml" }] },
    ],
    icons: [
      { src: "/icons/papersource-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/papersource-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
