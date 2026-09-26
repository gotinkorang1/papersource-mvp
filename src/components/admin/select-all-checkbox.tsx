"use client";

import { useEffect, useRef, useState } from "react";

function singularizeLabel(label: string) {
  if (label.endsWith("ies")) return `${label.slice(0, -3)}y`;
  if (label.endsWith("s")) return label.slice(0, -1);
  return label;
}

export function SelectAllCheckbox({ count, name = "productId", label = "products", formId }: { count: number; name?: string; label?: string; formId?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState(0);
  const selectedLabel = selected === 1 ? singularizeLabel(label) : label;

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const sync = () => {
      const boxes = Array.from(form.elements).filter((element): element is HTMLInputElement => element instanceof HTMLInputElement && element.name === name);
      setSelected(boxes.filter((box) => box.checked).length);
    };
    form.addEventListener("change", sync);
    form.addEventListener("reset", sync);
    sync();
    return () => {
      form.removeEventListener("change", sync);
      form.removeEventListener("reset", sync);
    };
  }, [name]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = selected > 0 && selected < count;
  }, [count, selected]);

  return (
    <span className="inline-flex items-center gap-2">
      <input
        ref={inputRef}
        form={formId}
        type="checkbox"
        aria-label={count > 0 && selected === count ? `Deselect all ${label}` : `Select all ${label}`}
        checked={count > 0 && selected === count}
        disabled={count === 0}
        onChange={(event) => {
          const form = event.currentTarget.form;
          if (!form) return;
          Array.from(form.elements).filter((element): element is HTMLInputElement => element instanceof HTMLInputElement && element.name === name).forEach((box) => {
            box.checked = event.currentTarget.checked;
          });
          setSelected(event.currentTarget.checked ? count : 0);
          // Notify any second select-all control in the same form so its
          // count, indeterminate state, and accessible label stay in sync.
          form.dispatchEvent(new Event("change", { bubbles: true }));
        }}
        className="size-5 rounded border-border accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
      />
      <span aria-live="polite" aria-label={`${selected} ${selectedLabel} selected`} className="rounded-full bg-muted px-2 py-0.5 text-[0.7rem] font-medium tabular-nums text-slate">{selected}</span>
    </span>
  );
}
