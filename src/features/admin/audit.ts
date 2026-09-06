import { getDb } from "@/lib/db/client";
import { auditLogs } from "@/lib/db/schema";

export async function recordAdminAudit(input: { actorProfileId: string; action: string; resourceType: string; resourceId?: string | null; metadata?: Record<string, unknown> }) {
  try {
    await getDb().insert(auditLogs).values({ actorProfileId: input.actorProfileId, action: input.action, resourceType: input.resourceType, resourceId: input.resourceId ?? null, metadata: input.metadata ?? null });
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && error.code === "42P01")) throw error;
  }
}
