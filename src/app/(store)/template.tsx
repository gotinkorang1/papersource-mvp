import type { ReactNode } from "react";

export default function StoreTemplate({ children }: { children: ReactNode }) {
  return <div className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300">{children}</div>;
}
