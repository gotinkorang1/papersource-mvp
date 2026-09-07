"use client";

import { useEffect, useRef, useState } from "react";

export function SelectAllCheckbox({ count }: { count: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const sync = () => {
      const boxes = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="productId"]'));
      setSelected(boxes.filter((box) => box.checked).length);
    };
    form.addEventListener("change", sync);
    sync();
    return () => form.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = selected > 0 && selected < count;
  }, [count, selected]);

  return (
    <input
      ref={inputRef}
      type="checkbox"
      aria-label={selected === count ? "Deselect all products" : "Select all products"}
      checked={count > 0 && selected === count}
      onChange={(event) => {
        const form = event.currentTarget.form;
        if (!form) return;
        form.querySelectorAll<HTMLInputElement>('input[name="productId"]').forEach((box) => {
          box.checked = event.currentTarget.checked;
        });
        setSelected(event.currentTarget.checked ? count : 0);
      }}
      className="size-4 rounded border-border accent-primary"
    />
  );
}
