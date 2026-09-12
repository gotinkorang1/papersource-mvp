"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

export function BulkInventorySubmit({ formId, className }: { formId: string; className: string }) {
  const { pending } = useFormStatus();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const sync = () => {
      setSelected(document.querySelectorAll(`input[type="checkbox"][form="${formId}"][name="variantId"]:checked`).length);
    };
    document.addEventListener("change", sync);
    sync();
    return () => document.removeEventListener("change", sync);
  }, [formId]);

  return (
    <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
      <span className="text-xs text-slate" aria-live="polite">{selected} selected</span>
      <button type="submit" disabled={pending || selected === 0} aria-busy={pending} className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}>
        {pending ? <span aria-hidden="true" className="mr-2 inline-block size-3 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.1em]" /> : null}
        {pending ? "Updating stock…" : "Apply to selected"}
      </button>
    </div>
  );
}
