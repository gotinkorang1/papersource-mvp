"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CatalogueViewModeControl, type CatalogueViewMode } from "@/components/products/catalogue-view-mode";
import { AdminStatusBadge } from "@/components/admin/status-badge";
import { SelectAllCheckbox } from "@/components/admin/select-all-checkbox";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { cn } from "@/lib/utils";
import { readLocalValue, writeLocalValue } from "@/lib/browser/local-storage";

const STORAGE_KEY = "papersource.admin.products.view-mode";

export type AdminProductListRow = {
  id: string;
  name: string;
  brandName: string;
  categoryName: string;
  productType: string;
  status: string;
  isNew: boolean;
  imageCount: number;
  isTrending: boolean;
  viewCount?: number;
};

export function AdminProductsView({ rows, canWrite }: { rows: AdminProductListRow[]; canWrite: boolean }) {
  const [viewMode, setViewMode] = useState<CatalogueViewMode>("default");
  useEffect(() => {
    const saved = readLocalValue(STORAGE_KEY);
    if (saved === "default" || saved === "grid" || saved === "list" || saved === "content") {
      // Client preference is read after hydration to avoid accessing window on the server.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewMode(saved);
      return;
    }
    if (window.matchMedia?.("(max-width: 639px)").matches) {
      // Mobile default is deliberately selected after hydration.
      setViewMode("list");
    }
  }, []);
  const changeMode = (next: CatalogueViewMode) => {
    setViewMode(next);
    writeLocalValue(STORAGE_KEY, next);
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate" aria-live="polite">{rows.length} products on this page</p>
        <CatalogueViewModeControl value={viewMode} onChange={changeMode} compact />
      </div>
      <form action="/admin/products/mutate" method="post" className="overflow-hidden rounded-xl border border-border bg-card">
        {canWrite ? <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/30 p-3"><input type="hidden" name="intent" value="bulk-update-products" />{viewMode !== "default" ? <SelectAllCheckbox count={rows.length} label="products" /> : null}<label className="sr-only" htmlFor="bulk-status">Bulk action</label><select id="bulk-status" name="status" defaultValue="draft" className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"><option value="active">Set active</option><option value="draft">Set draft</option><option value="archived">Archive</option></select><SubmitProgressButton requiresSelection idleLabel="Apply to selected" pendingLabel="Updating products…" className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground" /><span className="text-xs text-slate" aria-live="polite">Select products below to update them together.</span></div> : null}
        {viewMode === "default" ? <table className="admin-responsive-table w-full min-w-[52rem] text-sm"><caption className="sr-only">Catalogue products</caption><thead className="sticky top-0 z-10 bg-card"><tr className="border-b border-border text-left text-slate">{canWrite ? <th className="w-12 px-4 py-3"><SelectAllCheckbox count={rows.length} /></th> : null}<th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Brand</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Images</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b border-border transition-colors hover:bg-muted/40 last:border-0">{canWrite ? <td className="px-4 py-3" data-label="Select"><input type="checkbox" name="productId" value={row.id} aria-label={`Select ${row.name}`} className="size-4 rounded border-border accent-primary" /></td> : null}<td className="px-4 py-3" data-label="Name"><Link href={`/admin/products/${row.id}`} className="font-medium text-ink underline underline-offset-2">{row.name}</Link>{row.isNew ? <span className="ml-2 rounded-full bg-ochre/20 px-2 py-0.5 text-[0.68rem] font-semibold text-ink">New</span> : null}{row.isTrending ? <span className="ml-2 rounded-full bg-paper-green/15 px-2 py-0.5 text-[0.68rem] font-semibold text-paper-green">Trending{row.viewCount ? ` · ${row.viewCount}` : ""}</span> : null}</td><td className="px-4 py-3" data-label="Brand">{row.brandName}</td><td className="px-4 py-3" data-label="Category">{row.categoryName}</td><td className="px-4 py-3" data-label="Type">{row.productType}</td><td className="px-4 py-3" data-label="Status"><AdminStatusBadge status={row.status} /></td><td className="px-4 py-3" data-label="Images"><Link href={`/admin/products/${row.id}#images`} className="font-medium text-ink underline underline-offset-2">{row.imageCount} · Manage images</Link></td></tr>)}</tbody></table> : <div data-catalogue-view={viewMode} className={cn("grid gap-3 p-3 sm:p-4", viewMode === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>{rows.map((row) => <article key={row.id} className={cn("rounded-xl border border-border bg-background p-4", viewMode === "content" && "sm:flex sm:items-center sm:justify-between sm:gap-6")}><div className="min-w-0"><div className="flex flex-wrap items-center gap-2">{canWrite ? <input type="checkbox" name="productId" value={row.id} aria-label={`Select ${row.name}`} className="size-4 rounded border-border accent-primary" /> : null}{row.isNew ? <span className="rounded-full bg-ochre/20 px-2 py-0.5 text-[0.68rem] font-semibold text-ink">New</span> : null}{row.isTrending ? <span className="rounded-full bg-paper-green/15 px-2 py-0.5 text-[0.68rem] font-semibold text-paper-green">Trending{row.viewCount ? ` · ${row.viewCount}` : ""}</span> : null}<AdminStatusBadge status={row.status} /></div><h2 className="mt-3 truncate text-base font-semibold text-ink"><Link href={`/admin/products/${row.id}`} className="underline underline-offset-2">{row.name}</Link></h2><p className="mt-1 text-sm text-slate">{row.brandName} · {row.categoryName} · {row.imageCount} images</p>{viewMode === "content" ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate">{row.productType} product in the shared catalogue. Manage content, images, inventory, pricing, and aliases from the product workspace.</p> : null}</div><div className="mt-4 flex flex-wrap gap-3 text-sm sm:mt-0"><Link href={`/admin/products/${row.id}`} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-border px-3 font-medium text-ink underline-offset-2 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:flex-none">Edit product</Link><Link href={`/admin/products/${row.id}#images`} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-border px-3 font-medium text-ink underline-offset-2 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:flex-none">Manage images</Link></div></article>)}</div>}
      </form>
    </div>
  );
}
