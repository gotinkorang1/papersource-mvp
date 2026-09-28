export type SocialLink = { label: string; href: string; external?: boolean };

const configured = [
  // Keep the verified public profiles available in every environment. The
  // public env vars can still override these values for a future rebrand.
  ["Instagram", process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/papersourcegh/"],
  ["Facebook", process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "https://www.facebook.com/papersourcegh"],
  ["LinkedIn", process.env.NEXT_PUBLIC_LINKEDIN_URL],
  ["TikTok", process.env.NEXT_PUBLIC_TIKTOK_URL],
] as const;

export const socialLinks: SocialLink[] = [
  ...configured.flatMap(([label, href]) => href ? [{ label, href, external: true }] : []),
  { label: "WhatsApp", href: "https://wa.me/233555001313", external: true },
];
