export function isLiveEmail() {
  return process.env.EMAIL_MODE === "live";
}

export function emailFrom() {
  const configured = process.env.EMAIL_FROM?.trim();
  if (configured) {
    return configured;
  }

  if (isLiveEmail() && process.env.NODE_ENV === "production") {
    throw new Error("EMAIL_FROM is required when EMAIL_MODE=live");
  }

  return "PaperSource <paper@papersource.test>";
}

export function staffNotifyEmail() {
  return process.env.STAFF_NOTIFY_EMAIL?.trim() || "sales@papersource.test";
}

export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.papersourcegh.com";

  try {
    const url = new URL(raw);
    // Keep email links on the same canonical host as metadata and sitemaps.
    // The apex domain redirects to www in production, so avoid sending a
    // customer through that extra hop from an order or quote email.
    if (url.hostname === "papersourcegh.com") url.hostname = "www.papersourcegh.com";
    return url.toString().replace(/\/+$/, "");
  } catch {
    // A malformed optional environment value must not create broken links in
    // transactional email. Fall back to the known production origin.
    return "https://www.papersourcegh.com";
  }
}

export function absoluteUrl(path: string) {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${normalised}`;
}
