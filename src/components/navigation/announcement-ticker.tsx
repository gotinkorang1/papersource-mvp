import { BadgeCheck, Store, Truck } from "lucide-react";

const announcements = [
  { label: "Shop pickup", detail: "Free collection", Icon: Store },
  { label: "Accra & Tema", detail: "Reliable delivery", Icon: Truck },
  { label: "Every price", detail: "VAT included", Icon: BadgeCheck },
] as const;

export function AnnouncementTicker() {
  return (
    <div role="region" className="border-t border-border/60 bg-ink text-paper" aria-label="PaperSource service highlights">
      <p className="sr-only">Free shop pickup, Accra and Tema delivery, and VAT-inclusive prices.</p>
      <div className="overflow-hidden">
        <div className="announcement-ticker-track flex min-w-max items-center justify-center gap-8 px-4 py-2 text-[11px] font-semibold tracking-[0.08em] sm:gap-12 sm:text-xs">
          {[...announcements, ...announcements].map(({ label, detail, Icon }, index) => (
            <span key={`${label}-${index}`} aria-hidden={index >= announcements.length} className="inline-flex items-center gap-2 whitespace-nowrap">
              <Icon className="size-3.5 text-ochre" aria-hidden="true" />
              <span>{label}</span>
              <span className="font-normal text-paper/70">{detail}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
