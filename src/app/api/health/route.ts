import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, isDatabaseConfigured } from "@/lib/db/client";
import { captureServerException } from "@/lib/observability/sentry";
import { getStoreSettings } from "@/features/settings/admin";
import { isLiveEmail } from "@/lib/email/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const checks: {
    database: "ok" | "not_configured" | "error";
    observability: "configured" | "not_configured";
    integrations: {
      paystack: "configured" | "test_mode" | "not_configured";
      email: "configured" | "mock_mode" | "not_configured";
      cloudinary: "configured" | "not_configured";
    };
  } = {
    database: "not_configured",
    observability: process.env.SENTRY_DSN ? "configured" : "not_configured",
    integrations: {
      paystack: "test_mode",
      email: isLiveEmail()
        ? (process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim() ? "configured" : "not_configured")
        : "mock_mode",
      cloudinary: process.env.CLOUDINARY_URL?.trim() || (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() && process.env.CLOUDINARY_API_KEY?.trim() && process.env.CLOUDINARY_API_SECRET?.trim())
        ? "configured"
        : "not_configured",
    },
  };

  if (isDatabaseConfigured()) {
    try {
      await getDb().execute(sql`select 1`);
      checks.database = "ok";
      const settings = await getStoreSettings();
      const paystackSecret = process.env.PAYSTACK_SECRET_KEY?.trim() ?? "";
      checks.integrations.paystack = settings.paymentMode === "live"
        ? (paystackSecret.startsWith("sk_live_") ? "configured" : "not_configured")
        : "test_mode";
    } catch (error) {
      checks.database = "error";
      checks.integrations.paystack = "not_configured";
      captureServerException(error, {
        operation: "health_check",
        route: new URL(request.url).pathname,
        dependency: "postgres",
      });
    }
  }

  const healthy = checks.database === "ok";
  const healthSecret = process.env.HEALTHCHECK_SECRET?.trim();
  const detailed = Boolean(healthSecret && request.headers.get("authorization") === `Bearer ${healthSecret}`);
  const payload: { status: "ok" | "degraded"; durationMs: number; checks?: typeof checks } = {
    status: healthy ? "ok" : "degraded",
    durationMs: Date.now() - startedAt,
  };
  if (detailed) payload.checks = checks;

  const responseHeaders: Record<string, string> = { "Cache-Control": "no-store" };
  if (!healthy) responseHeaders["Retry-After"] = "60";

  return NextResponse.json(
    payload,
    {
      status: healthy ? 200 : 503,
      headers: responseHeaders,
    },
  );
}

