import { socialLinks } from "@/lib/social";

export function SocialLinks() {
  return <nav aria-label="Social media" className="flex flex-wrap gap-2">
    {socialLinks.map((link) => {
      return <a key={link.label} href={link.href} target={link.external ? "_blank" : undefined} rel={link.external ? "noreferrer" : undefined} aria-label={`PaperSource on ${link.label}`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-medium text-ink transition hover:-translate-y-0.5 hover:border-ink hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"><span aria-hidden className="grid size-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-white">{link.label.slice(0, 1)}</span>{link.label}</a>;
    })}
  </nav>;
}
