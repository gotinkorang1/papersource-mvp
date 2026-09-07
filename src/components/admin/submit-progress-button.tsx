"use client";

import { useFormStatus } from "react-dom";

export function SubmitProgressButton({
  idleLabel,
  pendingLabel,
  className,
}: {
  idleLabel: string;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`${className} disabled:cursor-wait disabled:opacity-60`}>
      {pending ? <span aria-hidden="true" className="mr-2 inline-block size-3 animate-spin rounded-full border-2 border-current border-r-transparent align-[-0.1em]" /> : null}
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
