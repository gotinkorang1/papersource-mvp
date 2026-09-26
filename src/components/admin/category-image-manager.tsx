"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { adminFieldClass } from "@/components/admin/field";
import { paperButton } from "@/components/commerce/paper-button";
import { cloudinaryImageUrl } from "@/lib/cloudinary";

const types = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export function CategoryImageManager({ categoryId, imagePublicId }: { categoryId: string; imagePublicId: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedId, setUploadedId] = useState<string | null>(null);
  const [savedImagePublicId, setSavedImagePublicId] = useState(imagePublicId);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const currentImageUrl = savedImagePublicId ? cloudinaryImageUrl(savedImagePublicId, 300) : null;
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function choose(next?: File) {
    if (!next) return;
    if (!types.includes(next.type) || next.size > 2 * 1024 * 1024) { setStatus("Use a JPG, PNG, WebP or AVIF image under 2 MB."); return; }
    setFile(next); setPreview(URL.createObjectURL(next)); setUploadedId(null); setStatus(null);
  }
  async function upload() {
    if (!file) return;
    setBusy(true); setStatus("Uploading image…");
    try { const body = new FormData(); body.append("file", file); const response = await fetch("/admin/categories/upload-image", { method: "POST", body }); const result = (await response.json()) as { publicId?: string; error?: string }; if (!response.ok || !result.publicId) throw new Error(result.error ?? "Upload failed."); setUploadedId(result.publicId); setStatus("Uploaded. Save the image to this category."); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Upload failed."); }
    finally { setBusy(false); }
  }
  async function save(id: string) {
    setBusy(true); setStatus("Saving image…"); const body = new FormData(); body.append("intent", "update-image"); body.append("categoryId", categoryId); body.append("imagePublicId", id);
    try { const response = await fetch("/admin/categories/mutate", { method: "POST", body, headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" } }); if (!response.ok) throw new Error(((await response.json()) as { error?: string }).error ?? "Could not save image."); setSavedImagePublicId(id); setFile(null); setPreview(null); setUploadedId(null); setUrl(""); setStatus("Category image saved."); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Could not save image."); }
    finally { setBusy(false); }
  }
  async function remove() {
    setBusy(true); setStatus("Removing image…"); const body = new FormData(); body.append("intent", "remove-image"); body.append("categoryId", categoryId);
    try { const response = await fetch("/admin/categories/mutate", { method: "POST", body, headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" } }); if (!response.ok) throw new Error("Could not remove image."); setSavedImagePublicId(null); setStatus("Category image removed."); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Could not remove image."); }
    finally { setBusy(false); }
  }
  return <div className="mt-4 rounded-lg border border-border bg-muted/20 p-4"><div className="flex flex-wrap items-start gap-4"><div className="grid size-28 place-items-center overflow-hidden rounded-lg border border-border bg-cream/30 dark:bg-ink/30">{preview ? <Image src={preview} alt="New category preview" width={112} height={112} unoptimized className="size-full object-cover" /> : currentImageUrl ? <Image src={currentImageUrl} alt="Current category image" width={112} height={112} className="size-full object-cover" /> : <span className="px-2 text-center text-xs text-slate">No image</span>}</div><div className="min-w-0 flex-1"><p className="font-medium text-ink">Category image</p><p className="mt-1 text-xs text-slate">One optimized image · JPG, PNG, WebP or AVIF · max 2 MB</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" className={paperButton({ variant: "secondary", className: "min-h-11" })} onClick={() => inputRef.current?.click()} disabled={busy}>Choose image</button>{file && !uploadedId ? <button type="button" className={paperButton({ className: "min-h-11" })} onClick={() => void upload()} disabled={busy}>Upload</button> : null}{savedImagePublicId ? <button type="button" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-red-700 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink dark:text-red-300" onClick={() => void remove()} disabled={busy}>Remove</button> : null}</div><input ref={inputRef} type="file" accept={types.join(",")} className="sr-only" onChange={(event) => { choose(event.target.files?.[0]); event.currentTarget.value = ""; }} />{uploadedId ? <button type="button" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-paper-green underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" onClick={() => void save(uploadedId)} disabled={busy}>Save uploaded image to category</button> : null}</div></div><div className="mt-4 border-t border-border pt-3"><label className="grid gap-1 text-sm font-medium text-ink">Or paste a Cloudinary URL or public ID<input value={url} onChange={(event) => setUrl(event.target.value)} className={adminFieldClass} placeholder="papersource/categories/paper" /></label><button type="button" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-paper-green underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" onClick={() => void save(url.trim())} disabled={busy || !url.trim()}>Save pasted image</button></div>{status ? <p role="status" className="mt-3 text-xs text-slate">{status}</p> : null}</div>;
}
