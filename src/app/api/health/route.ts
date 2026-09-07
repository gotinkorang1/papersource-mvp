import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { captureServerException } from "@/lib/observability/sentry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const checks: {
    database: "ok" | "not_configured" | "error";
    observability: "configured" | "not_configured";
  } = {
    database: "not_configured",
    observability: process.env.SENTRY_DSN ? "configured" : "not_configured",
  };

  if (isDatabaseConfigured()) {
    try {
      await getDb().execute(sql`select 1`);
      checks.database = "ok";
    } catch (error) {
      checks.database = "error";
      captureServerException(error, {
        operation: "health_check",
        route: new URL(request.url).pathname,
        dependency: "postgres",
      });
    }
  }

  const healthy = checks.database === "ok";
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks,
      durationMs: Date.now() - startedAt,
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

