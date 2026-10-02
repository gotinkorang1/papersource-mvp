"use client";

import type { ComponentProps, ReactNode } from "react";

export function ConfirmSubmitForm({
  confirmation,
  children,
  ...props
}: ComponentProps<"form"> & { confirmation: string; children: ReactNode }) {
  return (
    <form
      {...props}
      onSubmit={(event) => {
        if (props.onSubmit) props.onSubmit(event);
        if (!event.defaultPrevented && !window.confirm(confirmation)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}
