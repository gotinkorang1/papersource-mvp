import type { ReactNode } from "react";
import { StoreShell } from "@/components/navigation/store-shell";

export default function CorporateLayout({ children }: { children: ReactNode }) {
  return <StoreShell>{children}</StoreShell>;
}
