import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { canAccessAdmin } from "@/lib/staff/rbac";
import { readStaffActor } from "@/lib/staff/require";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function cloudinaryCredentials() {
  const raw = process.env.CLOUDINARY_URL;
  const splitCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const splitApiKey = process.env.CLOUDINARY_API_KEY;
  const splitApiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!raw && splitCloudName && splitApiKey && splitApiSecret) {
    return { cloudName: splitCloudName, apiKey: splitApiKey, apiSecret: splitApiSecret };
  }
  if (!raw) throw new Error("Cloudinary server credentials are missing. Set CLOUDINARY_URL or the split Cloudinary variables in Vercel Production.");
  try {
    const parsed = new URL(raw);
    const cloudName = parsed.hostname;
    const apiKey = decodeURIComponent(parsed.username);
    const apiSecret = decodeURIComponent(parsed.password);
    if (cloudName && apiKey && apiSecret) return { cloudName, apiKey, apiSecret };
  } catch {
    // Fall through to split credentials below when the combined URL is malformed.
  }
  if (splitCloudName && splitApiKey && splitApiSecret) return { cloudName: splitCloudName, apiKey: splitApiKey, apiSecret: splitApiSecret };
  throw new Error("Cloudinary credentials are invalid. Check CLOUDINARY_URL or the split Cloudinary variables in Vercel Production.");
}

function signature(params: Record<string, string>, apiSecret: string) {
  const serialized = Object.entries(params)
    .filter(([, value]) => value)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

export async function POST(request: Request) {
  const actor = await readStaffActor();
  if (!actor || !canAccessAdmin(actor.role, "products", "write")) {
    return NextResponse.json({ error: "You do not have permission to upload product images." }, { status: 403 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image file first." }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, WebP, or AVIF image." }, { status: 400 });
    if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Each image must be 2 MB or smaller." }, { status: 400 });

    const { cloudName, apiKey, apiSecret } = cloudinaryCredentials();
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "papersource/products";
    const transformation = "c_limit,w_1600,h_1600,q_auto,f_auto";
    const params = { folder, timestamp, transformation };
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", apiKey);
    body.append("timestamp", timestamp);
    body.append("folder", folder);
    body.append("transformation", transformation);
    body.append("signature", signature(params, apiSecret));

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(30_000),
    });
    const payload = (await response.json()) as { public_id?: string; secure_url?: string; error?: { message?: string } };
    if (!response.ok || !payload.public_id) {
      return NextResponse.json({ error: payload.error?.message ?? "Cloudinary could not process that image." }, { status: 502 });
    }
    return NextResponse.json({ publicId: payload.public_id, secureUrl: payload.secure_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
