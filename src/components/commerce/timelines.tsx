import { cn } from "@/lib/utils";
import type { OrderStatus, QuoteStatus } from "@/types/catalogue";

const quoteSteps: QuoteStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "priced",
  "sent",
  "accepted",
  "payment_pending",
  "paid",
  "order_created",
];

const orderSteps: OrderStatus[] = [
  "pending_payment",
  "paid",
  "processing",
  "out_for_delivery",
  "delivered",
];

function Timeline({
  steps,
  current,
  labels,
}: {
  steps: string[];
  current: string;
  labels: Record<string, string>;
}) {
  const currentIndex = steps.indexOf(current);

  return (
    <ol className="space-y-2 border-l border-border pl-4">
      {steps.map((step, index) => {
        const done = currentIndex >= index;
        return (
          <li key={step} className="relative">
            <span
              className={cn(
                "absolute -left-[21px] top-1.5 h-2 w-2 rounded-full",
                done ? "bg-ink" : "bg-border",
              )}
            />
            <p className={cn("text-sm", done ? "text-ink" : "text-slate")}>
              {labels[step] ?? step}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

const quoteLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  priced: "Priced",
  sent: "Sent",
  accepted: "Accepted",
  payment_pending: "Payment pending",
  paid: "Paid",
  order_created: "Order created",
};

const orderLabels: Record<string, string> = {
  pending_payment: "Pending payment",
  paid: "Paid",
  processing: "Processing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

export function QuoteTimeline({ status }: { status: QuoteStatus }) {
  if (
    status === "declined" ||
    status === "expired" ||
    status === "cancelled" ||
    status === "revised"
  ) {
    return <p className="text-sm text-error">{quoteLabels[status] ?? status}</p>;
  }

  return (
    <Timeline steps={quoteSteps} current={status} labels={quoteLabels} />
  );
}

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return <p className="text-sm text-error">Cancelled</p>;
  }

  const current =
    status === "awaiting_terms" ? "pending_payment" : status;

  return (
    <Timeline steps={orderSteps} current={current} labels={orderLabels} />
  );
}
