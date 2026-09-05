import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createSupabaseServiceClient } from "@/lib/supabase/admin";

const DOCUMENTS_BUCKET = "documents";

export function isLiveStorage() {
  return process.env.STORAGE_MODE === "live";
}

function localRoot() {
  return path.join(process.cwd(), ".data", "documents");
}

function assertRelativeObjectPath(objectPath: string) {
  if (!objectPath || objectPath.includes("..") || path.isAbsolute(objectPath)) {
    throw new Error("Invalid document path.");
  }
}

export async function putPrivateObject(input: {
  objectPath: string;
  bytes: Uint8Array;
  mime: string;
}) {
  assertRelativeObjectPath(input.objectPath);
  if (isLiveStorage()) {
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(input.objectPath, input.bytes, {
        contentType: input.mime,
        upsert: false,
      });
    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const full = path.join(localRoot(), input.objectPath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, input.bytes);
}

export async function readPrivateObject(objectPath: string) {
  assertRelativeObjectPath(objectPath);
  if (isLiveStorage()) {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .download(objectPath);
    if (error || !data) {
      throw new Error(error?.message ?? "Could not read that file.");
    }
    return Buffer.from(await data.arrayBuffer());
  }

  const rooted = path.resolve(localRoot());
  const resolved = path.resolve(rooted, objectPath);
  const relative = path.relative(rooted, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Invalid document path.");
  }
  return readFile(resolved);
}
