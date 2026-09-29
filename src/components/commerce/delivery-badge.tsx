import type { DeliveryBadgeModel } from "@/types/catalogue";

export function DeliveryBadge({ zone }: { zone: DeliveryBadgeModel }) {
  const text =
    zone.feeMode === "on_request"
      ? "Nationwide delivery can be arranged on request"
      : zone.label;

  return (
    <div className="space-y-0.5 text-sm text-slate">
      <p>{text}</p>
      {zone.pickupAvailable ? (
        <p className="font-medium text-paper-green">Shop pickup available</p>
      ) : null}
    </div>
  );
}
