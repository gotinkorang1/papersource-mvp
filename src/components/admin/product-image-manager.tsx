"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { paperButton } from "@/components/commerce/paper-button";
import { adminFieldClass } from "@/components/admin/field";

type UploadItem = { file: File; preview: string; status: "ready" | "uploading" | "done" | "error"; error?: string; publicId?: string };

export function ProductImageManager({ productId, imageCount }: { productId: string; imageCount: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [url, setUrl] = useState("");
  const [urlAlt, setUrlAlt] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const remaining = Math.max(0, 4 - imageCount - items.length);
    const selectedFiles = Array.from(files);
    const eligible = selectedFiles.filter((file) => file.size <= 2 * 1024 * 1024 && ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type));
    const rejected = selectedFiles.length - eligible.length;
    const next = eligible.slice(0, remaining).map((file) => ({ file, preview: URL.createObjectURL(file), status: "ready" as const }));
    if (rejected || eligible.length > remaining) setNotice(`${rejected ? `${rejected} file${rejected === 1 ? "" : "s"} skipped: use JPG, PNG, WebP or AVIF under 2 MB. ` : ""}${eligible.length > remaining ? `Only ${remaining} image${remaining === 1 ? "" : "s"} can be added because the product limit is 4.` : ""}`);
    else setNotice(null);
    setItems((current) => [...current, ...next]);
  }

  function remove(index: number) {
    setItems((current) => {
      URL.revokeObjectURL(current[index]?.preview ?? "");
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  async function upload(item: UploadItem, index: number) {
    setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, status: "uploading", error: undefined } : entry));
    const body = new FormData();
    body.append("file", item.file);
    try {
      const response = await fetch("/admin/products/upload-image", { method: "POST", body });
      const result = (await response.json()) as { publicId?: string; error?: string };
      if (!response.ok || !result.publicId) throw new Error(result.error ?? "Upload failed.");
      setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, status: "done", publicId: result.publicId } : entry));
    } catch (error) {
      setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, status: "error", error: error instanceof Error ? error.message : "Upload failed." } : entry));
    }
  }

  const canAdd = imageCount + items.length < 4;
  return (
    <div className="mt-4 space-y-5">
      <div className="rounded-lg border border-dashed border-border bg-cream/30 p-4 dark:bg-ink/30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><p className="font-medium text-ink">Upload from device</p><p className="mt-1 text-xs text-slate">JPG, PNG, WebP or AVIF · max 2 MB each</p></div>
          <button type="button" className={paperButton({ variant: "secondary", className: "min-h-10" })} onClick={() => inputRef.current?.click()} disabled={!canAdd}>Choose images</button>
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" onChange={(event) => { addFiles(event.target.files); event.currentTarget.value = ""; }} />
        {notice ? <p className="mt-3 text-xs text-paper-green" role="status">{notice}</p> : null}
        {items.length > 0 ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{items.map((item, index) => <div key={`${item.file.name}-${index}`} className="flex gap-3 rounded-lg border border-border bg-card p-2">
          <Image src={item.preview} alt="" width={64} height={64} unoptimized className="h-16 w-16 rounded-md object-cover" />
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{item.file.name}</p><p className="text-xs text-slate">{(item.file.size / 1024 / 1024).toFixed(2)} MB · {item.status === "uploading" ? "Uploading…" : item.status === "done" ? "Uploaded — save it below" : item.status === "error" ? item.error : "Not uploaded"}</p><div className="mt-2 flex gap-3">{item.status === "ready" || item.status === "error" ? <button type="button" className="text-xs font-semibold text-paper-green underline" onClick={() => upload(item, index)}>Upload</button> : null}<button type="button" className="text-xs text-slate underline" onClick={() => remove(index)}>Remove</button></div>{item.status === "done" && item.publicId ? <form action="/admin/products/mutate" method="post" className="mt-3 grid gap-2 border-t border-border pt-3"><input type="hidden" name="intent" value="add-image" /><input type="hidden" name="productId" value={productId} /><input type="hidden" name="cloudinaryPublicId" value={item.publicId} /><input type="hidden" name="position" value={imageCount + index} /><label className="grid gap-1 text-xs font-medium text-ink">Alt text<input name="alt" required defaultValue={item.file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")} className={adminFieldClass} /></label><SubmitProgressButton idleLabel="Save to product" pendingLabel="Saving…" className="min-h-9 px-3 text-xs" /></form> : null}</div>
        </div>)}</div> : null}
      </div>
      <form action="/admin/products/mutate" method="post" className="grid gap-3 rounded-lg border border-border bg-card p-4"><input type="hidden" name="intent" value="add-image" /><input type="hidden" name="productId" value={productId} /><label className="grid gap-1 text-sm font-medium text-ink">Or paste a Cloudinary image URL or public ID<input name="cloudinaryPublicId" required value={url} onChange={(event) => setUrl(event.target.value)} className={adminFieldClass} placeholder="https://res.cloudinary.com/... or papersource/products/..." /></label><label className="grid gap-1 text-sm font-medium text-ink">Alt text<input name="alt" required value={urlAlt} onChange={(event) => setUrlAlt(event.target.value)} className={adminFieldClass} placeholder="Product image description" /></label><SubmitProgressButton idleLabel="Add image URL" pendingLabel="Adding image…" className={paperButton({ variant: "secondary" })} /></form>
    </div>
  );
}
