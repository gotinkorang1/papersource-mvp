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
    background_color: "#102a43",
    theme_color: "#102a43",
    lang: "en-GH",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/papersource-logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/papersource-logo.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Orders", short_name: "Orders", url: "/admin/orders", icons: [{ src: "/icons/papersource-logo.png", sizes: "512x512", type: "image/png" }] },
      { name: "Quotes", short_name: "Quotes", url: "/admin/quotes", icons: [{ src: "/icons/papersource-logo.png", sizes: "512x512", type: "image/png" }] },
      { name: "Products", short_name: "Products", url: "/admin/products", icons: [{ src: "/icons/papersource-logo.png", sizes: "512x512", type: "image/png" }] },
    ],
  };
}
