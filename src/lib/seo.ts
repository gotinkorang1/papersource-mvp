import type { Metadata } from "next";

export const SITE_NAME = "PaperSource Ghana";
export const SITE_URL = "https://www.papersourcegh.com";
export const DEFAULT_DESCRIPTION =
  "Office stationery, paper, printing supplies and workplace essentials delivered across Accra and Tema. Nationwide supply on request.";
export const DEFAULT_SHARE_IMAGE = "/images/catalogue-stationery-generated.png";

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
  };
}
