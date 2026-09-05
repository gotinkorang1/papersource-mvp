import { Check } from "lucide-react";
import type { OrderStatus } from "@/types/catalogue";

const steps: Array<{ key: OrderStatus; label: string; hint: string }> = [
  { key: "pending_payment", label: "Order received", hint: "Your order is recorded." },
  { key: "paid", label: "Payment confirmed", hint: "Payment has been verified." },
  { key: "processing", label: "Being prepared", hint: "Our team is preparing your items." },
  { key: "out_for_delivery", label: "Out for delivery", hint: "Your order is on the way." },
  { key: "delivered", label: "Delivered", hint: "Order complete." },
];

export function OrderStatusTimeline({ status }: { status: OrderStatus }) {
  const active = steps.findIndex((step) => step.key === status);
  return <ol aria-label="Order progress" className="mt-10 grid gap-4 sm:grid-cols-5">{steps.map((step, index) => <li key={step.key} className="relative flex gap-3 sm:block"><span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full border ${index <= active ? "border-paper-green bg-paper-green text-white" : "border-border bg-card text-slate"}`}>{index < active ? <Check className="size-4" aria-hidden /> : index + 1}</span><div className="sm:mt-3"><p className={`text-sm font-semibold ${index <= active ? "text-ink" : "text-slate"}`}>{step.label}</p><p className="mt-1 text-xs text-slate">{step.hint}</p></div></li>)}</ol>;
}
