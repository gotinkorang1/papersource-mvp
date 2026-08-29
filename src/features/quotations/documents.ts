import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { uploadedDocuments } from "@/lib/db/schema";
import type { DocumentPurpose } from "@/lib/db/schema";
import {
  assertAllowedDocument,
  DocumentUploadError,
  MAX_DOCUMENTS_PER_RFQ,
  safeFilename,
} from "@/lib/documents/mime";
import { putPrivateObject } from "@/lib/documents/store";

export async function attachQuoteDocumentsFromForm(input: {
  quoteId: string;
  organizationId?: string | null;
  formData: FormData;
}) {
  const purpose = parsePurpose(input.formData.get("documentPurpose"));
  const files = input.formData
    .getAll("documents")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (files.length === 0) {
    return [];
  }
  if (files.length > MAX_DOCUMENTS_PER_RFQ) {
    throw new DocumentUploadError("Attach up to five files.");
  }

  const saved = [];
  for (const file of files) {
    const mime = assertAllowedDocument({
      filename: file.name,
      mime: file.type,
      size: file.size,
    });
    const filename = safeFilename(file.name);
    const objectPath = `${input.quoteId}/${crypto.randomUUID()}-${filename}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    await putPrivateObject({ objectPath, bytes, mime });

    const db = getDb();
    const [row] = await db
      .insert(uploadedDocuments)
      .values({
        quoteId: input.quoteId,
        organizationId: input.organizationId ?? undefined,
        bucket: "documents",
        path: objectPath,
        filename,
        mime,
        purpose,
      })
      .returning();
    if (row) {
      saved.push(row);
    }
  }
  return saved;
}

export async function listQuoteDocuments(quoteId: string) {
  const db = getDb();
  return db
    .select()
    .from(uploadedDocuments)
    .where(eq(uploadedDocuments.quoteId, quoteId));
}

export async function getUploadedDocument(id: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(uploadedDocuments)
    .where(eq(uploadedDocuments.id, id))
    .limit(1);
  return row ?? null;
}

function parsePurpose(raw: FormDataEntryValue | null): DocumentPurpose {
  const value = String(raw ?? "rfq");
  if (
    value === "rfq" ||
    value === "purchase_order" ||
    value === "procurement_list" ||
    value === "invoice" ||
    value === "internal"
  ) {
    return value;
  }
  return "rfq";
}
