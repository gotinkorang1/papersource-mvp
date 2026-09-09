"use client";

import { useState } from "react";

export function CopySkuButton({ sku }: { sku: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    setFailed(false);
    try {
      await navigator.clipboard.writeText(sku);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
      setFailed(true);
      window.setTimeout(() => setFailed(false), 2400);
    }
  }

  return <button type="button" onClick={copy} className="inline-flex min-h-8 items-center gap-2 rounded-md border border-border px-2.5 py-1 text-xs font-mono text-slate transition hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" aria-label={`Copy SKU ${sku}`}>
    <span>SKU {sku}</span><span aria-live="polite" className="font-sans text-[0.65rem] font-semibold uppercase tracking-wide text-ink">{copied ? "Copied" : failed ? "Copy unavailable" : "Copy"}</span>
  </button>;
}
