"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { SubmitProgressButton } from "@/components/admin/submit-progress-button";
import { paperButton } from "@/components/commerce/paper-button";
import { adminFieldClass } from "@/components/admin/field";

type UploadItem = { file: File; preview: string; status: "ready" | "uploading" | "done" | "saving" | "saved" | "error"; error?: string; publicId?: string };
type CropRatio = "free" | "4:5" | "5:4" | "3:4" | "4:3";

const cropRatios: { value: CropRatio; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "4:5", label: "4:5" },
  { value: "5:4", label: "5:4" },
  { value: "3:4", label: "3:4" },
  { value: "4:3", label: "4:3" },
];

async function cropImageFile(file: File, ratio: CropRatio) {
  if (ratio === "free") return file;
  const sourceUrl = URL.createObjectURL(file);
  try {
    const source = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("This image could not be edited."));
      image.src = sourceUrl;
    });
    const [ratioWidth, ratioHeight] = ratio.split(":").map(Number);
    const sourceRatio = source.naturalWidth / source.naturalHeight;
    const targetRatio = ratioWidth / ratioHeight;
    let cropWidth = source.naturalWidth;
    let cropHeight = source.naturalHeight;
    if (sourceRatio > targetRatio) cropWidth = Math.round(cropHeight * targetRatio);
    else cropHeight = Math.round(cropWidth / targetRatio);
    const maxDimension = 1800;
    const scale = Math.min(1, maxDimension / Math.max(cropWidth, cropHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(cropWidth * scale));
    canvas.height = Math.max(1, Math.round(cropHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser cannot edit this image.");
    context.imageSmoothingQuality = "high";
    context.drawImage(source, (source.naturalWidth - cropWidth) / 2, (source.naturalHeight - cropHeight) / 2, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, file.type === "image/png" ? "image/png" : "image/jpeg", 0.88));
    if (!blob) throw new Error("This image could not be edited.");
    const extension = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + `.${extension}`, { type: blob.type, lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export function ProductImageManager({ productId, imageCount }: { productId: string; imageCount: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const itemsRef = useRef<UploadItem[]>([]);
  const [url, setUrl] = useState("");
  const [urlAlt, setUrlAlt] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const [cropRatio, setCropRatio] = useState<CropRatio>("free");
  const [isCropping, setIsCropping] = useState(false);
  const [uploadingAll, setUploadingAll] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);

  itemsRef.current = items;
  useEffect(() => () => {
    for (const item of itemsRef.current) URL.revokeObjectURL(item.preview);
  }, []);

  useEffect(() => {
    const hasUnsaved = items.some((item) => item.status !== "saved");
    if (!hasUnsaved) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [items]);

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

  function movePending(index: number, direction: "up" | "down") {
    setItems((current) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  async function upload(item: UploadItem, index: number): Promise<boolean> {
    setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, status: "uploading", error: undefined } : entry));
    const body = new FormData();
    body.append("file", item.file);
    try {
      const response = await fetch("/admin/products/upload-image", { method: "POST", body });
      const result = (await response.json()) as { publicId?: string; error?: string };
      if (!response.ok || !result.publicId) throw new Error(result.error ?? "Upload failed.");
      setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, status: "done", publicId: result.publicId } : entry));
      return true;
    } catch (error) {
      setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, status: "error", error: error instanceof Error ? error.message : "Upload failed." } : entry));
      return false;
    }
  }

  async function uploadAllPending() {
    const pending = items.map((item, index) => ({ item, index })).filter(({ item }) => item.status === "ready" || item.status === "error");
    if (!pending.length) return;
    setUploadingAll(true);
    setUploadProgress({ done: 0, total: pending.length });
    setNotice(`Uploading 0 of ${pending.length} image${pending.length === 1 ? "" : "s"}…`);
    try {
      const results: boolean[] = [];
      let completed = 0;
      for (const { item, index } of pending) {
        results.push(await upload(item, index));
        completed += 1;
        setUploadProgress({ done: completed, total: pending.length });
        setNotice(`Uploading ${completed} of ${pending.length}…`);
      }
      const successful = results.filter(Boolean).length;
      setNotice(`${successful} of ${pending.length} image${pending.length === 1 ? "" : "s"} uploaded. Add alt text and save each one to the product.`);
    } finally {
      setUploadingAll(false);
      setUploadProgress(null);
    }
  }

  async function saveImage(form: HTMLFormElement, index: number) {
    setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, status: "saving", error: undefined } : entry));
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error ?? "Could not save this image.");
      setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, status: "saved" } : entry));
    } catch (error) {
      setItems((current) => current.map((entry, itemIndex) => itemIndex === index ? { ...entry, status: "done", error: error instanceof Error ? error.message : "Could not save this image." } : entry));
    }
  }

  async function applyCrop() {
    if (cropIndex === null) return;
    const item = items[cropIndex];
    if (!item) return;
    setIsCropping(true);
    try {
      const file = await cropImageFile(item.file, cropRatio);
      if (file.size > 2 * 1024 * 1024) throw new Error("The cropped image is still over 2 MB. Choose a smaller image or another ratio.");
      const preview = URL.createObjectURL(file);
      URL.revokeObjectURL(item.preview);
      setItems((current) => current.map((entry, index) => index === cropIndex ? { ...entry, file, preview, error: undefined, status: "ready" } : entry));
      setCropIndex(null);
      setNotice("Crop applied. Upload this image when you are ready.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not crop this image.");
    } finally {
      setIsCropping(false);
    }
  }

  const canAdd = imageCount + items.length < 4;
  return (
    <div className="mt-4 space-y-5">
      <div className="rounded-lg border border-dashed border-border bg-cream/30 p-4 dark:bg-ink/30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div><p className="font-medium text-ink">Upload from device</p><p className="mt-1 text-xs text-slate">JPG, PNG, WebP or AVIF · max 2 MB each</p></div>
          <div className="flex flex-wrap gap-2"><button type="button" className={paperButton({ variant: "secondary", className: "min-h-10" })} onClick={() => inputRef.current?.click()} disabled={!canAdd || uploadingAll}>Choose images</button>{items.some((item) => item.status === "ready" || item.status === "error") ? <button type="button" className={paperButton({ className: "min-h-10" })} onClick={() => void uploadAllPending()} disabled={uploadingAll}>{uploadingAll && uploadProgress ? `Uploading ${uploadProgress.done}/${uploadProgress.total}…` : "Upload all pending"}</button> : null}</div>
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" onChange={(event) => { addFiles(event.target.files); event.currentTarget.value = ""; }} />
        {notice ? <p className="mt-3 text-xs text-paper-green" role="status">{notice}</p> : null}
        {items.length > 0 ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{items.map((item, index) => <div key={`${item.file.name}-${index}`} className="flex gap-3 rounded-lg border border-border bg-card p-2">
          <Image src={item.preview} alt="" width={64} height={64} unoptimized className="h-16 w-16 rounded-md object-cover" />
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{item.file.name}</p><p className="text-xs text-slate">{(item.file.size / 1024 / 1024).toFixed(2)} MB · {item.status === "uploading" ? "Uploading…" : item.status === "done" ? "Uploaded — save it below" : item.status === "saving" ? "Saving…" : item.status === "saved" ? "Saved to product" : item.status === "error" ? item.error : "Not uploaded"}</p><div className="mt-2 flex flex-wrap gap-3">{item.status === "ready" || item.status === "error" ? <button type="button" className="text-xs font-semibold text-paper-green underline" onClick={() => upload(item, index)}>Upload</button> : null}{item.status !== "saved" && item.status !== "saving" && item.status !== "uploading" ? <button type="button" className="text-xs text-slate underline" onClick={() => { setCropIndex(index); setCropRatio("free"); }}>Crop</button> : null}{item.status !== "saved" && item.status !== "saving" ? <><button type="button" className="text-xs text-slate underline disabled:opacity-40" onClick={() => movePending(index, "up")} disabled={index === 0}>Move earlier</button><button type="button" className="text-xs text-slate underline disabled:opacity-40" onClick={() => movePending(index, "down")} disabled={index === items.length - 1}>Move later</button><button type="button" className="text-xs text-slate underline" onClick={() => remove(index)}>Remove</button></> : null}</div>{(item.status === "done" || item.status === "saving") && item.publicId ? <form action="/admin/products/mutate" method="post" onSubmit={(event) => { event.preventDefault(); void saveImage(event.currentTarget, index); }} className="mt-3 grid gap-2 border-t border-border pt-3"><input type="hidden" name="intent" value="add-image" /><input type="hidden" name="productId" value={productId} /><input type="hidden" name="cloudinaryPublicId" value={item.publicId} /><input type="hidden" name="position" value={imageCount + index} /><label className="grid gap-1 text-xs font-medium text-ink">Alt text<input name="alt" required defaultValue={item.file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")} className={adminFieldClass} disabled={item.status === "saving"} /></label><SubmitProgressButton idleLabel="Save to product" pendingLabel="Saving…" className="min-h-9 px-3 text-xs" /></form> : null}</div>
        </div>)}</div> : null}
      </div>
      <form action="/admin/products/mutate" method="post" className="grid gap-3 rounded-lg border border-border bg-card p-4"><input type="hidden" name="intent" value="add-image" /><input type="hidden" name="productId" value={productId} /><label className="grid gap-1 text-sm font-medium text-ink">Or paste a Cloudinary image URL or public ID<input name="cloudinaryPublicId" required value={url} onChange={(event) => setUrl(event.target.value)} className={adminFieldClass} placeholder="https://res.cloudinary.com/... or papersource/products/..." /></label><label className="grid gap-1 text-sm font-medium text-ink">Alt text<input name="alt" required value={urlAlt} onChange={(event) => setUrlAlt(event.target.value)} className={adminFieldClass} placeholder="Product image description" /></label><SubmitProgressButton idleLabel="Add image URL" pendingLabel="Adding image…" className={paperButton({ variant: "secondary" })} /></form>
      {cropIndex !== null && items[cropIndex] ? <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4" role="dialog" aria-modal="true" aria-labelledby="crop-image-title"><div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h3 id="crop-image-title" className="font-heading text-xl text-ink">Crop image</h3><p className="mt-1 text-sm text-slate">Choose a ratio, then apply a centered crop before uploading.</p></div><button type="button" className="text-sm text-slate underline" onClick={() => setCropIndex(null)} disabled={isCropping}>Close</button></div><div className="mt-4 grid place-items-center rounded-lg bg-ink/10 p-3"><Image src={items[cropIndex].preview} alt="Preview of image being cropped" width={480} height={320} unoptimized className="max-h-64 w-full rounded-md object-contain" /></div><div className="mt-4 flex flex-wrap gap-2">{cropRatios.map((ratio) => <button key={ratio.value} type="button" onClick={() => setCropRatio(ratio.value)} className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${cropRatio === ratio.value ? "border-paper-green bg-paper-green text-white" : "border-border text-ink hover:border-paper-green"}`}>{ratio.label}</button>)}</div><div className="mt-5 flex justify-end gap-2"><button type="button" className={paperButton({ variant: "secondary" })} onClick={() => setCropIndex(null)} disabled={isCropping}>Cancel</button><button type="button" className={paperButton({ variant: "primary" })} onClick={() => void applyCrop()} disabled={isCropping}>{isCropping ? "Applying…" : "Apply crop"}</button></div></div></div> : null}
    </div>
  );
}
