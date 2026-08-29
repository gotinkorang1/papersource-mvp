export const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;
export const MAX_DOCUMENTS_PER_RFQ = 5;

export const ALLOWED_DOCUMENT_MIMES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const EXTENSION_MIME: Record<string, (typeof ALLOWED_DOCUMENT_MIMES)[number]> = {
  ".pdf": "application/pdf",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export class DocumentUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DocumentUploadError";
  }
}

export function extensionOf(filename: string) {
  const match = /\.[a-z0-9]+$/i.exec(filename.trim());
  return match ? match[0].toLowerCase() : "";
}

export function mimeForFilename(filename: string, reported?: string | null) {
  const fromName = EXTENSION_MIME[extensionOf(filename)];
  if (!fromName) {
    return null;
  }
  if (reported && reported !== "application/octet-stream" && reported !== fromName) {
    if (
      (fromName === "image/jpeg" && reported === "image/jpg") ||
      reported === fromName
    ) {
      return fromName;
    }
    return null;
  }
  return fromName;
}

export function assertAllowedDocument(input: {
  filename: string;
  mime?: string | null;
  size: number;
}) {
  if (input.size <= 0) {
    throw new DocumentUploadError("That file is empty.");
  }
  if (input.size > MAX_DOCUMENT_BYTES) {
    throw new DocumentUploadError("Each file must be 15 MB or smaller.");
  }
  const mime = mimeForFilename(input.filename, input.mime);
  if (!mime || !ALLOWED_DOCUMENT_MIMES.includes(mime)) {
    throw new DocumentUploadError(
      "Upload a PDF, Excel, Word, JPEG, PNG or WebP file.",
    );
  }
  return mime;
}

export function safeFilename(filename: string) {
  const base = filename.replace(/\\/g, "/").split("/").pop() ?? "file";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120);
  return cleaned.length > 0 ? cleaned : "file";
}
