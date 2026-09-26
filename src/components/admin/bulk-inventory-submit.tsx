"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import { useFormStatus } from "react-dom";

export function BulkInventorySubmit({ formId, className }: { formId: string; className: string }) {
  const { pending } = useFormStatus();
  const [selected, setSelected] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const form = document.getElementById(formId);
    if (!(form instanceof HTMLFormElement)) return;
    const sync = () => {
      setSelected(Array.from(form.elements).filter((element) => element instanceof HTMLInputElement && element.type === "checkbox" && element.name === "variantId" && element.checked).length);
    };
    const handleSubmit = () => setSubmitted(true);
    form.addEventListener("change", sync);
    form.addEventListener("submit", handleSubmit);
    form.addEventListener("reset", sync);
    sync();
    return () => {
      form.removeEventListener("change", sync);
      form.removeEventListener("submit", handleSubmit);
      form.removeEventListener("reset", sync);
    };
  }, [formId]);

  const busy = pending || submitted;

  return (
    <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
      <span className="text-xs text-slate" aria-live="polite">{selected} selected</span>
      <button ref={buttonRef} type="submit" disabled={busy || selected === 0} aria-busy={busy} aria-live="polite" className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}>
        {busy ? <span aria-hidden="true" className="mr-2 inline-block size-3 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.1em]" /> : null}
        {busy ? "Updating stock…" : "Apply to selected"}
      </button>
    </div>
  );
}
