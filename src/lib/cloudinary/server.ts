import { createHash } from "node:crypto";

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
    } catch { /* fall through to the split variables */ }
  }
  if (cloudName && apiKey && apiSecret) return { cloudName, apiKey, apiSecret };
  return null;
}

function signature(params: Record<string, string>, apiSecret: string) {
  const serialized = Object.entries(params).filter(([, value]) => value).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("&");
  return createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

/** Best-effort cleanup for an image no longer referenced by the catalogue. */
export async function destroyCloudinaryImage(publicId: string) {
  const config = credentials();
  if (!config || !publicId) return false;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const body = new FormData();
  body.append("public_id", publicId);
  body.append("timestamp", timestamp);
  body.append("api_key", config.apiKey);
  body.append("signature", signature({ public_id: publicId, timestamp }, config.apiSecret));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`, { method: "POST", body, signal: AbortSignal.timeout(15_000) });
  return response.ok;
}
