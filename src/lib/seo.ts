import type { Metadata } from "next";

export const SITE_NAME = "PaperSource Ghana";
export const SITE_URL = "https://www.papersourcegh.com";
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
        logo: absoluteUrl("/icons/papersource-512.svg"),
        email: "info@papersourcegh.com",
        telephone: "+233555001313",
        parentOrganization: { "@type": "Organization", name: "NiiPlants Group Ghana Limited" },
        sameAs: [],
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
