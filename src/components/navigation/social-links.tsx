import { socialLinks } from "@/lib/social";
import { BriefcaseBusiness, Camera, MessageCircle, Music2, Users } from "lucide-react";

const socialIcons = { Facebook: Users, Instagram: Camera, LinkedIn: BriefcaseBusiness, TikTok: Music2, WhatsApp: MessageCircle } as const;

export function SocialLinks() {
  return <nav aria-label="Social media" className="flex flex-wrap gap-2">
    {socialLinks.map((link) => {
      const Icon = socialIcons[link.label as keyof typeof socialIcons] ?? MessageCircle;
      return <a key={link.label} href={link.href} target={link.external ? "_blank" : undefined} rel={link.external ? "noreferrer" : undefined} aria-label={`PaperSource on ${link.label}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-medium text-ink transition hover:-translate-y-0.5 hover:border-ink hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"><span aria-hidden className="grid size-5 place-items-center rounded-full bg-ink text-white"><Icon className="size-3" aria-hidden="true" /></span>{link.label}</a>;
    })}
  </nav>;
}
