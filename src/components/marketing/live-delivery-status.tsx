"use client";

import { CircleCheck } from "lucide-react";
import { useEffect, useState } from "react";

const messages = ["Orders being prepared in Accra", "Same-day options available in core zones", "Bulk quote requests reviewed by our team"];

export function LiveDeliveryStatus() {
  const [index, setIndex] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setIndex((value) => (value + 1) % messages.length), 5000); return () => window.clearInterval(timer); }, []);
  return <div className="mt-6 inline-flex max-w-full items-center gap-2 rounded-full border border-paper-green/20 bg-paper-green/5 px-3 py-2 text-xs font-medium text-paper-green motion-safe:animate-in motion-safe:fade-in-0" aria-live="polite"><CircleCheck className="size-4 shrink-0" aria-hidden /><span>{messages[index]}</span></div>;
}
