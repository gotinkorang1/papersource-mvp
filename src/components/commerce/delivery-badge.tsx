import type { DeliveryBadgeModel } from "@/types/catalogue";

export function DeliveryBadge({ zone }: { zone: DeliveryBadgeModel }) {
  const text =
    zone.feeMode === "on_request"
      ? "Nationwide delivery can be arranged on request"
      : zone.label;

  return <p className="text-sm text-slate">{text}</p>;
}
