import { describe, expect, it } from "vitest";
import {
  assertAllowedDocument,
  DocumentUploadError,
  mimeForFilename,
  safeFilename,
} from "./mime";
import { documentAccessValid, signDocumentAccess } from "./sign";
import { isQuotePastExpiry } from "@/features/quotations/expire";
import { canTransitionQuote } from "@/features/quotations/transitions";

describe("document MIME allowlist", () => {
  it("accepts PDF, Excel, Word and images", () => {
    expect(mimeForFilename("list.xlsx")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    expect(
      assertAllowedDocument({
        filename: "rfq.pdf",
        mime: "application/pdf",
        size: 1024,
      }),
    ).toBe("application/pdf");
  });

  it("rejects executables and oversized files", () => {
    expect(() =>
      assertAllowedDocument({ filename: "payload.exe", mime: "application/x-msdownload", size: 10 }),
    ).toThrow(DocumentUploadError);
    expect(() =>
      assertAllowedDocument({
        filename: "huge.pdf",
        mime: "application/pdf",
        size: 16 * 1024 * 1024,
      }),
    ).toThrow(/15 MB/);
  });

  it("strips path segments from filenames", () => {
    expect(safeFilename("..\\secret.pdf")).toBe("secret.pdf");
  });
});

describe("signed document URLs", () => {
  it("accepts a fresh signature and rejects an expired one", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    const fresh = signDocumentAccess(id);
    expect(documentAccessValid(id, String(fresh.exp), fresh.signature)).toBe(true);
    expect(documentAccessValid(id, String(Date.now() - 1000), fresh.signature)).toBe(
      false,
    );
  });
});

describe("quote expiry and revise", () => {
  it("expires only a sent quote that is past expires_at", () => {
    expect(
      isQuotePastExpiry({
        status: "sent",
        expiresAt: new Date("2020-01-01T00:00:00.000Z"),
      }),
    ).toBe(true);
    expect(
      isQuotePastExpiry({
        status: "priced",
        expiresAt: new Date("2020-01-01T00:00:00.000Z"),
      }),
    ).toBe(false);
  });

  it("allows sent → revised and sent → expired", () => {
    expect(canTransitionQuote("sent", "revised")).toBe(true);
    expect(canTransitionQuote("sent", "expired")).toBe(true);
    expect(canTransitionQuote("accepted", "order_created")).toBe(true);
  });
});
