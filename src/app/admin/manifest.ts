import type { MetadataRoute } from "next";

/** A separate install target keeps staff shortcuts and navigation scoped to the operations desk. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PaperSource Operations",
    short_name: "PS Operations",
    description: "PaperSource staff operations dashboard.",
    id: "/admin",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "any",
    background_color: "#2b3231",
    theme_color: "#2b3231",
    lang: "en-GH",
    categories: ["business", "productivity"],
    icons: [
      { src: "/brand/papersource-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/papersource-logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/papersource-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Orders", short_name: "Orders", url: "/admin/orders", icons: [{ src: "/brand/papersource-icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icons/papersource-logo.png", sizes: "512x512", type: "image/png" }] },
      { name: "Quotes", short_name: "Quotes", url: "/admin/quotes", icons: [{ src: "/brand/papersource-icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icons/papersource-logo.png", sizes: "512x512", type: "image/png" }] },
      { name: "Products", short_name: "Products", url: "/admin/products", icons: [{ src: "/brand/papersource-icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icons/papersource-logo.png", sizes: "512x512", type: "image/png" }] },
    ],
  };
}
