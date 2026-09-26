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

  useEffect(() => {
    if (!requiresSelection) return;
    const form = buttonRef.current?.form;
    if (!form) return;
    const sync = () => setHasSelection(Array.from(form.elements).some((element) => element instanceof HTMLInputElement && element.type === "checkbox" && Boolean(element.name) && element.checked));
    document.addEventListener("change", sync);
    sync();
    return () => document.removeEventListener("change", sync);
  }, [requiresSelection]);

  return (
    <button ref={buttonRef} type="submit" disabled={pending || disabled || (requiresSelection && !hasSelection)} aria-label={ariaLabel} aria-busy={pending} aria-live="polite" className={`${className} min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60`}>
      {pending ? <span aria-hidden="true" className="mr-2 inline-block size-3 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.1em]" /> : null}
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
