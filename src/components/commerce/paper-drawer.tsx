"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
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
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const wasOpen = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) {
        previousFocus.current?.focus();
      }
      wasOpen.current = false;
      return;
    }

    wasOpen.current = true;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (event.key === "Tab") {
        const focusable = Array.from(drawerRef.current?.querySelectorAll<HTMLElement>(
          'aside[role="dialog"] button, aside[role="dialog"] a, aside[role="dialog"] input, aside[role="dialog"] select, aside[role="dialog"] textarea, aside[role="dialog"] [tabindex]:not([tabindex="-1"])',
        ) ?? []).filter((element) => !element.hasAttribute("disabled"));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
    }, [open]);

  if (!open) {
    return null;
  }

  const drawerName = title.toLowerCase().replaceAll(/\s+/g, "-");

  return (
      <div
      ref={drawerRef}
      id={`paper-drawer-${drawerName}`}
      className="fixed inset-0 z-50"
      data-testid={`paper-drawer-${drawerName}`}
    >
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
            ref={closeRef}
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-slate transition-[background-color,color,transform] hover:-translate-y-0.5 hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:translate-y-0"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? (
          <footer className="mt-auto space-y-3 border-t border-border px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
