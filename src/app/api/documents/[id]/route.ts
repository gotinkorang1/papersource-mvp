import { NextResponse } from "next/server";
import { getUploadedDocument } from "@/features/quotations/documents";
import { documentAccessValid } from "@/lib/documents/sign";
import { readPrivateObject } from "@/lib/documents/store";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const exp = url.searchParams.get("exp") ?? "";
  const sig = url.searchParams.get("sig") ?? "";

  if (!documentAccessValid(id, exp, sig)) {
    return NextResponse.json({ error: "That download link has expired." }, { status: 403 });
  }

  const document = await getUploadedDocument(id);
  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  try {
    const bytes = await readPrivateObject(document.path);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": document.mime,
        "Content-Disposition": `attachment; filename="${document.filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Could not read that file." }, { status: 404 });
  }
}
