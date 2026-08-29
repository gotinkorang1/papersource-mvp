import type { ReactNode } from "react";

export const adminFieldClass =
  "mt-1 h-10 w-full rounded-md border border-border bg-cream px-3 text-sm text-ink";

export const adminAreaClass =
  "mt-1 min-h-24 w-full rounded-md border border-border bg-cream px-3 py-2 text-sm text-ink";

export function AdminField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="text-ink">{label}</span>
      {children}
    </label>
  );
}

export function AdminError({ error }: { error?: string }) {
  if (!error) {
    return null;
  }
  return (
    <p role="alert" className="mt-4 border border-error/40 bg-white px-4 py-3 text-sm text-error">
      {error}
    </p>
  );
}
