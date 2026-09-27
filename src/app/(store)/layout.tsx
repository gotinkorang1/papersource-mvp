import type { ReactNode } from "react";
import { StoreShell } from "@/components/navigation/store-shell";

export const dynamic = "force-dynamic";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return <StoreShell>{children}</StoreShell>;
}
