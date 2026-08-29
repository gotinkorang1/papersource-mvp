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
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${normalised}`;
}
