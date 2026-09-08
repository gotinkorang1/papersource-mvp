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
    orientation: "portrait-primary",
    background_color: "#f8f6f1",
    theme_color: "#102a43",
    lang: "en-GH",
    categories: ["business", "shopping"],
    prefer_related_applications: false,
    icons: [
      { src: "/icons/papersource-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/papersource-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
