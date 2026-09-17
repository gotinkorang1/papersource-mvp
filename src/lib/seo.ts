import type { Metadata } from "next";
import { publicEnv } from "@/lib/env";

export const SITE_NAME = "PaperSource Ghana";
// Keep one canonical host everywhere: metadata, JSON-LD, and sitemaps must agree.
// The deployment URL may override this for previews, while production defaults to
// the public host documented in docs/SEO.md.
function canonicalSiteUrl(raw: string) {
  const url = new URL(raw);
  if (url.hostname === "www.papersourcegh.com") url.hostname = "papersourcegh.com";
  return url.toString().replace(/\/+$/, "");
}

export const SITE_URL = canonicalSiteUrl(publicEnv.NEXT_PUBLIC_SITE_URL || "https://papersourcegh.com");
export const DEFAULT_DESCRIPTION =
  "Office stationery, paper, printing supplies and workplace essentials delivered across Accra and Tema. Nationwide supply on request.";
export const DEFAULT_SHARE_IMAGE = "/images/catalogue-stationery-generated.png";
export const SEO_KEYWORDS = [
  "office supplies Ghana",
  "stationery supplier Accra",
  "paper and printing supplies Ghana",
  "bulk office supplies",
  "school stationery Ghana",
  "workplace essentials Accra",
];

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

/** Builds a concise PDP title without emitting an empty-part separator. */
export function productSeoTitle(name: string, specLine: string) {
  return [name, specLine]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" · ");
}

type PageSeo = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

/** Shared metadata keeps previews consistent when a page is shared. */
export function pageMetadata({ title, description, path, image = DEFAULT_SHARE_IMAGE }: PageSeo): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    keywords: SEO_KEYWORDS,
    applicationName: SITE_NAME,
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "business",
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_GH",
      siteName: SITE_NAME,
      title,
      description,
      url,
      images: [{ url: imageUrl, width: 1200, height: 900, alt: `${title} | ${SITE_NAME}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  };
}

/** Site-wide entities used by search engines and social previews. */
export function siteJsonLd() {
  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE_NAME,
        legalName: "PaperSource",
        url: SITE_URL,
        logo: absoluteUrl("/icons/papersource-logo.png"),
        email: "info@papersourcegh.com",
        telephone: "+233555001313",
        parentOrganization: { "@type": "Organization", name: "NiiPlants Group Ghana Limited" },
        sameAs: [],
        contactPoint: { "@type": "ContactPoint", telephone: "+233555001313", contactType: "customer service", areaServed: "GH", availableLanguage: "en" },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#local-business`,
        name: SITE_NAME,
        url: SITE_URL,
        image: absoluteUrl(DEFAULT_SHARE_IMAGE),
        parentOrganization: { "@id": organizationId },
        email: "info@papersourcegh.com",
        telephone: "+233555001313",
        areaServed: ["Accra", "Tema", "Ghana"],
        address: { "@type": "PostalAddress", addressLocality: "Accra", addressRegion: "Greater Accra", addressCountry: "GH" },
        priceRange: "GHS",
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: SITE_NAME,
        url: SITE_URL,
        publisher: { "@id": organizationId },
        inLanguage: "en-GH",
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function collectionPageJsonLd(input: {
  name: string;
  description: string;
  url: string;
  totalItems?: number;
  items: Array<{ name: string; url: string; position: number }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${input.url}#collection`,
    name: input.name,
    description: input.description,
    url: input.url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.totalItems ?? input.items.length,
      itemListElement: input.items.map((item) => ({
        "@type": "ListItem",
        position: item.position,
        name: item.name,
        url: item.url,
      })),
    },
  };
}

export function collectionItemPosition(page: number, pageSize: number, index: number) {
  return Math.max(0, page - 1) * pageSize + index + 1;
}

export function webPageJsonLd(input: {
  name: string;
  description: string;
  url: string;
  dateModified?: Date | string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${input.url}#webpage`,
    name: input.name,
    description: input.description,
    url: input.url,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    ...(input.dateModified ? { dateModified: new Date(input.dateModified).toISOString() } : {}),
  };
}
