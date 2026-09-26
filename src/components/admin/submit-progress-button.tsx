"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useRef, useState } from "react";

export function SubmitProgressButton({
  idleLabel,
  pendingLabel,
  className,
  disabled = false,
  ariaLabel,
  requiresSelection = false,
}: {
  idleLabel: string;
  pendingLabel: string;
  className: string;
  disabled?: boolean;
  ariaLabel?: string;
  requiresSelection?: boolean;
}) {
  const { pending } = useFormStatus();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [hasSelection, setHasSelection] = useState(!requiresSelection);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const form = buttonRef.current?.form;
    if (!form) return;
    const handleSubmit = () => setSubmitted(true);
    const sync = () => setHasSelection(Array.from(form.elements).some((element) => element instanceof HTMLInputElement && element.type === "checkbox" && Boolean(element.name) && element.checked));
    form.addEventListener("submit", handleSubmit);
    if (!requiresSelection) return () => form.removeEventListener("submit", handleSubmit);
    form.addEventListener("change", sync);
    form.addEventListener("reset", sync);
    sync();
    return () => {
      form.removeEventListener("submit", handleSubmit);
      form.removeEventListener("change", sync);
      form.removeEventListener("reset", sync);
    };
  }, [requiresSelection]);

  const busy = pending || submitted;

  return (
    <button ref={buttonRef} type="submit" disabled={busy || disabled || (requiresSelection && !hasSelection)} aria-label={ariaLabel} aria-busy={busy} aria-live="polite" className={`${className} min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60`}>
      {busy ? <span aria-hidden="true" className="mr-2 inline-block size-3 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.1em]" /> : null}
      {busy ? pendingLabel : idleLabel}
    </button>
  );
}
