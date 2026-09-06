"use client";

import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";

export function PaperDrawer({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const drawerName = title.toLowerCase().replaceAll(/\s+/g, "-");

  return (
    <div className="fixed inset-0 z-50" data-testid={`paper-drawer-${drawerName}`}>
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label={`Close ${title}`}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-card shadow-lg motion-safe:animate-in motion-safe:slide-in-from-right duration-300"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg text-ink">
              {title}
            </h2>
            <p id={descriptionId} className="mt-1 text-sm text-slate">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border text-slate transition-[background-color,color,transform] hover:-translate-y-0.5 hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-y-0"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <footer className="mt-auto space-y-3 border-t border-border px-5 py-4">
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
