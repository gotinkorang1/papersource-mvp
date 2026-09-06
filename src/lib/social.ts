export type SocialLink = { label: string; href: string; external?: boolean };

const configured = [
  ["Instagram", process.env.NEXT_PUBLIC_INSTAGRAM_URL],
  ["Facebook", process.env.NEXT_PUBLIC_FACEBOOK_URL],
  ["LinkedIn", process.env.NEXT_PUBLIC_LINKEDIN_URL],
  ["TikTok", process.env.NEXT_PUBLIC_TIKTOK_URL],
] as const;

export const socialLinks: SocialLink[] = [
  ...configured.flatMap(([label, href]) => href ? [{ label, href, external: true }] : []),
  { label: "WhatsApp", href: "https://wa.me/233555001313", external: true },
];
