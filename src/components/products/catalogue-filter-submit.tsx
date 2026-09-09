"use client";

import { useFormStatus } from "react-dom";

export function CatalogueFilterSubmit() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="h-11 w-full rounded-lg bg-ink px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(16,42,67,0.14)] transition hover:-translate-y-0.5 hover:bg-ink/90 hover:shadow-[0_8px_18px_rgba(16,42,67,0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-70 dark:bg-ochre dark:text-ink dark:hover:bg-ochre/90 sm:col-span-2 lg:col-span-1 xl:col-span-1">{pending ? "Applying…" : "Apply"}</button>;
}
