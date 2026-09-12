"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ProductTaxonomyPicker } from "@/components/admin/product-taxonomy-picker";
import { adminAreaClass, adminFieldClass } from "@/components/admin/field";
import { paperButton } from "@/components/commerce/paper-button";

type Option = { id: string; name: string; parentId?: string | null; slug?: string | null; description?: string | null; imagePublicId?: string | null; position?: number; active?: boolean };
type PendingImage = { file: File; preview: string; publicId?: string; alt: string; status: "ready" | "uploading" | "uploaded" | "error"; error?: string };

export function NewProductForm({ brands, categories }: { brands: Option[]; categories: Option[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<PendingImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const remaining = Math.max(0, 4 - images.length);
    const selected = Array.from(files).filter((file) => file.size <= 2 * 1024 * 1024 && ["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)).slice(0, remaining);
    setImages((current) => [...current, ...selected.map((file) => ({ file, preview: URL.createObjectURL(file), alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), status: "ready" as const }))]);
    if (selected.length < files.length) setNotice("Only JPG, PNG, WebP or AVIF images under 2 MB are accepted, with a maximum of 4 images.");
    else setNotice(null);
  }

  async function uploadAll() {
    const pending = images.map((image, index) => ({ image, index })).filter(({ image }) => image.status === "ready" || image.status === "error");
    if (!pending.length) return;
    setUploading(true);
    setNotice(`Uploading 0 of ${pending.length} images…`);
    for (let completed = 0; completed < pending.length; completed += 1) {
      const { image, index } = pending[completed];
      setImages((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, status: "uploading", error: undefined } : entry));
      const body = new FormData();
      body.append("file", image.file);
      try {
        const response = await fetch("/admin/products/upload-image", { method: "POST", body });
        const result = (await response.json()) as { publicId?: string; error?: string };
        if (!response.ok || !result.publicId) throw new Error(result.error ?? "Upload failed.");
        setImages((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, publicId: result.publicId, status: "uploaded" } : entry));
      } catch (error) {
        setImages((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, status: "error", error: error instanceof Error ? error.message : "Upload failed." } : entry));
      }
      setNotice(`Uploading ${completed + 1} of ${pending.length} images…`);
    }
    setUploading(false);
    setNotice("Images uploaded. Review alt text, then create the product to save everything together.");
  }

  function move(index: number, direction: "up" | "down") {
    setImages((current) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <form action="/admin/products/mutate" method="post" className="mt-8 grid max-w-2xl gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <input type="hidden" name="intent" value="create-product" />
      <label className="block text-sm"><span className="text-ink">Name *</span><input name="name" required className={adminFieldClass} /></label>
      <label className="block text-sm"><span className="text-ink">Slug (optional)</span><input name="slug" className={adminFieldClass} placeholder="auto from name" /></label>
      <div className="text-sm"><span className="text-ink">Brand *</span><ProductTaxonomyPicker kind="brand" name="brandId" options={brands} /></div>
      <div className="text-sm"><span className="text-ink">Category *</span><ProductTaxonomyPicker kind="category" name="categoryId" options={categories} /></div>
      <label className="block text-sm"><span className="text-ink">Type</span><select name="productType" className={adminFieldClass} defaultValue="standard"><option value="standard">Standard</option><option value="bundle">Office pack</option></select></label>
      <label className="block text-sm"><span className="text-ink">Status</span><select name="status" className={adminFieldClass} defaultValue="draft"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
      <label className="block text-sm"><span className="text-ink">Description</span><textarea name="description" className={adminAreaClass} /></label>
      <label className="block text-sm"><span className="text-ink">First SKU *</span><input name="sku" required className={adminFieldClass} /></label>
      <label className="block text-sm"><span className="text-ink">Unit label</span><input name="unitLabel" className={adminFieldClass} defaultValue="each" /></label>
      <label className="block text-sm"><span className="text-ink">Base unit price (GHS) *</span><input name="baseUnitPrice" required className={adminFieldClass} placeholder="78.99" /></label>
      <div className="grid gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-2">
        <label className="block text-sm"><span className="text-ink">Opening stock</span><input name="openingStock" type="number" min="0" step="1" className={adminFieldClass} placeholder="0" /></label>
        <label className="block text-sm"><span className="text-ink">Low-stock threshold</span><input name="lowStockThreshold" type="number" min="0" step="1" className={adminFieldClass} placeholder="5" /></label>
        <p className="text-xs text-slate sm:col-span-2">Leave blank to start at 0 with a low-stock threshold of 5.</p>
      </div>
      <section className="grid gap-3 rounded-lg border border-dashed border-border bg-cream/30 p-4 dark:bg-ink/30" aria-labelledby="new-product-images">
        <div><h2 id="new-product-images" className="font-medium text-ink">Product images</h2><p className="mt-1 text-xs text-slate">Add up to 4 images · JPG, PNG, WebP or AVIF · max 2 MB each.</p></div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" onChange={(event) => { addFiles(event.target.files); event.currentTarget.value = ""; }} />
        <div className="flex flex-wrap gap-2"><button type="button" className={paperButton({ variant: "secondary", className: "min-h-10" })} onClick={() => inputRef.current?.click()} disabled={images.length >= 4 || uploading}>Choose images</button>{images.some((image) => image.status === "ready" || image.status === "error") ? <button type="button" className={paperButton({ className: "min-h-10" })} onClick={() => void uploadAll()} disabled={uploading}>{uploading ? "Uploading…" : "Upload all images"}</button> : null}</div>
        {notice ? <p role="status" className="text-xs text-slate">{notice}</p> : null}
        {images.map((image, index) => <div key={`${image.file.name}-${index}`} className="grid gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-[4rem_1fr]"><Image src={image.preview} alt="" width={64} height={64} unoptimized className="size-16 rounded-md object-cover" /><div className="min-w-0"><p className="truncate text-sm font-medium text-ink">{index + 1}. {image.file.name}</p><p className="text-xs text-slate">{image.status === "uploaded" ? "Uploaded and ready" : image.status === "uploading" ? "Uploading…" : image.status === "error" ? image.error : "Not uploaded"}</p>{image.status === "uploaded" ? <><input type="hidden" name="imagePublicId" value={image.publicId} /><input type="hidden" name="imagePosition" value={index} /><label className="mt-2 grid gap-1 text-xs font-medium text-ink">Alt text<input name="imageAlt" required value={image.alt} onChange={(event) => setImages((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, alt: event.target.value } : entry))} className={adminFieldClass} /></label></> : null}<div className="mt-2 flex flex-wrap gap-3"><button type="button" className="text-xs text-slate underline disabled:opacity-40" onClick={() => move(index, "up")} disabled={index === 0}>Move earlier</button><button type="button" className="text-xs text-slate underline disabled:opacity-40" onClick={() => move(index, "down")} disabled={index === images.length - 1}>Move later</button><button type="button" className="text-xs text-slate underline" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div></div></div>)}
      </section>
      <button type="submit" disabled={uploading || images.some((image) => image.status === "ready" || image.status === "uploading" || image.status === "error")} className={`${paperButton()} disabled:cursor-not-allowed disabled:opacity-60`}>{uploading ? "Uploading images…" : "Create product and save"}</button>
    </form>
  );
}
