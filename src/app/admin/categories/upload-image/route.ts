import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function credentials() {
  const raw = process.env.CLOUDINARY_URL;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!raw && cloudName && apiKey && apiSecret) return { cloudName, apiKey, apiSecret };
  if (raw) {
    try {
      const parsed = new URL(raw);
      if (parsed.hostname && parsed.username && parsed.password) return { cloudName: parsed.hostname, apiKey: decodeURIComponent(parsed.username), apiSecret: decodeURIComponent(parsed.password) };
    } catch { /* use split credentials below */ }
  }
  if (cloudName && apiKey && apiSecret) return { cloudName, apiKey, apiSecret };
  throw new Error("Cloudinary credentials are not configured.");
}

function sign(params: Record<string, string>, secret: string) {
  const serialized = Object.entries(params).filter(([, value]) => value).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&");
  return createHash("sha1").update(`${serialized}${secret}`).digest("hex");
}

export async function POST(request: Request) {
  const actor = await readStaffActor();
  if (!actor || !canAccessAdmin(actor.role, "categories", "write")) return NextResponse.json({ error: "You do not have permission to upload category images." }, { status: 403 });
  try {
    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image file first." }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, WebP, or AVIF image." }, { status: 400 });
    if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Each image must be 2 MB or smaller." }, { status: 400 });
    const { cloudName, apiKey, apiSecret } = credentials();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "papersource/categories";
    const transformation = "c_limit,w_1600,h_1200,q_auto,f_auto";
    const body = new FormData();
    body.append("file", file); body.append("api_key", apiKey); body.append("timestamp", timestamp); body.append("folder", folder); body.append("transformation", transformation);
    body.append("signature", sign({ folder, timestamp, transformation }, apiSecret));
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body, signal: AbortSignal.timeout(30_000) });
    const payload = (await response.json()) as { public_id?: string; secure_url?: string };
    if (!response.ok || !payload.public_id) return NextResponse.json({ error: "The image service could not process that file. Try another image." }, { status: 502 });
    return NextResponse.json({ publicId: payload.public_id, secureUrl: payload.secure_url });
  } catch (error) {
    console.error("[category-image-upload] upload failed", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 500 });
  }
}
