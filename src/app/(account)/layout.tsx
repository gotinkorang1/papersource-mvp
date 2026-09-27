import type { ReactNode } from "react";
import { StoreShell } from "@/components/navigation/store-shell";

// Account pages read the authenticated session, so they must render per request
// instead of being pre-rendered during the production build.
export const dynamic = "force-dynamic";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <StoreShell>{children}</StoreShell>;
}
