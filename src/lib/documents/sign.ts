import { createHmac, timingSafeEqual } from "node:crypto";
import { staffSecret } from "@/lib/staff/constants";

const SIGN_MS = 10 * 60 * 1000;

function documentSecret() {
  return process.env.DOCUMENT_SIGNING_SECRET?.trim() || staffSecret();
}

export function signDocumentAccess(documentId: string, now = Date.now()) {
  const exp = now + SIGN_MS;
  const payload = `${documentId}.${exp}`;
  const signature = createHmac("sha256", documentSecret())
    .update(payload)
    .digest("hex");
  return { exp, signature };
}

export function documentAccessValid(
  documentId: string,
  expRaw: string,
  signature: string,
) {
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Date.now()) {
    return false;
  }
  const payload = `${documentId}.${exp}`;
  const expected = createHmac("sha256", documentSecret())
    .update(payload)
    .digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function signedDocumentPath(documentId: string, now = Date.now()) {
  const { exp, signature } = signDocumentAccess(documentId, now);
  return `/api/documents/${documentId}?exp=${exp}&sig=${signature}`;
}
