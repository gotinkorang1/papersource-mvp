import type { ReactNode } from "react";

export const adminFieldClass =
  "mt-1 h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/20";

export const adminAreaClass =
  "mt-1 min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/20";

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
    <p role="alert" className="mt-4 rounded-md border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">
      {error}
    </p>
  );
}
