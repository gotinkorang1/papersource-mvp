"use client";

import { useState } from "react";
import { paperButton } from "@/components/commerce/paper-button";

type CropRatio = "free" | "4:5" | "5:4" | "3:4" | "4:3";
const ratios: CropRatio[] = ["free", "4:5", "5:4", "3:4", "4:3"];

async function cropRemoteImage(src: string, ratio: CropRatio) {
  const response = await fetch(src, { mode: "cors" });
  if (!response.ok) throw new Error("The saved image could not be loaded for editing.");
  const blob = await response.blob();
  const sourceUrl = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("This image could not be edited."));
      element.src = sourceUrl;
    });
    const sourceRatio = image.naturalWidth / image.naturalHeight;
    const targetRatio = ratio === "free" ? sourceRatio : Number(ratio.split(":")[0]) / Number(ratio.split(":")[1]);
    let width = image.naturalWidth;
    let height = image.naturalHeight;
    if (sourceRatio > targetRatio) width = Math.round(height * targetRatio);
    else height = Math.round(width / targetRatio);
    const scale = Math.min(1, 1800 / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser cannot edit this image.");
    context.imageSmoothingQuality = "high";
    context.drawImage(image, (image.naturalWidth - width) / 2, (image.naturalHeight - height) / 2, width, height, 0, 0, canvas.width, canvas.height);
    const result = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (!result || result.size > 2 * 1024 * 1024) throw new Error("The cropped image is over 2 MB. Choose another ratio.");
    return new File([result], "product-image.jpg", { type: "image/jpeg", lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export function SavedProductImageEditor({ productId, imageId, imageUrl }: { productId: string; imageId: string; imageUrl: string }) {
  const [open, setOpen] = useState(false);
  const [ratio, setRatio] = useState<CropRatio>("free");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function saveCrop() {
    setBusy(true);
    setNotice(null);
    try {
      const file = await cropRemoteImage(imageUrl, ratio);
      const body = new FormData();
      body.append("file", file);
      const upload = await fetch("/admin/products/upload-image", { method: "POST", body });
      const uploaded = (await upload.json()) as { publicId?: string; error?: string };
      if (!upload.ok || !uploaded.publicId) throw new Error(uploaded.error ?? "The cropped image could not be uploaded.");
      const update = await fetch("/admin/products/mutate", {
        method: "POST",
        headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
        body: new URLSearchParams({ intent: "replace-image", productId, imageId, cloudinaryPublicId: uploaded.publicId }),
      });
      const result = (await update.json()) as { error?: string };
      if (!update.ok) throw new Error(result.error ?? "The cropped image could not be saved.");
      setOpen(false);
      window.location.reload();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not crop this image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button type="button" className="text-xs text-slate underline" onClick={() => { setNotice(null); setOpen(true); }}>Crop</button>
      {open ? <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4" role="dialog" aria-modal="true" aria-labelledby={`saved-crop-${imageId}`}>
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-xl">
          <div className="flex items-start justify-between gap-4"><div><h3 id={`saved-crop-${imageId}`} className="font-heading text-xl text-ink">Crop saved image</h3><p className="mt-1 text-sm text-slate">The cropped replacement keeps this image’s position and alt text.</p></div><button type="button" className="text-sm text-slate underline" onClick={() => setOpen(false)} disabled={busy}>Close</button></div>
          <div className="mt-4 flex flex-wrap gap-2">{ratios.map((value) => <button key={value} type="button" onClick={() => setRatio(value)} className={`rounded-full border px-3 py-1.5 text-sm ${ratio === value ? "border-paper-green bg-paper-green text-white" : "border-border text-ink"}`}>{value}</button>)}</div>
          {notice ? <p role="alert" className="mt-3 text-sm text-red-700">{notice}</p> : null}
          <div className="mt-5 flex justify-end gap-2"><button type="button" className={paperButton({ variant: "secondary" })} onClick={() => setOpen(false)} disabled={busy}>Cancel</button><button type="button" className={paperButton()} onClick={() => void saveCrop()} disabled={busy}>{busy ? "Saving crop…" : "Save crop"}</button></div>
        </div>
      </div> : null}
    </>
  );
}
