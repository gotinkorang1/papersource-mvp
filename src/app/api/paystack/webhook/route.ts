import { processPaystackWebhook, WebhookPayloadError, WebhookSignatureError } from "@/features/payments/webhook";
import { captureServerException } from "@/lib/observability/sentry";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  try {
    await processPaystackWebhook(rawBody, signature);
  } catch (error) {
    if (error instanceof WebhookSignatureError) {
      return new Response("invalid signature", { status: 401 });
    }
    if (error instanceof WebhookPayloadError) {
      return new Response("invalid payload", { status: 400 });
    }
    captureServerException(error, {
      operation: "paystack_webhook",
      route: new URL(request.url).pathname,
      dependency: "paystack",
    });
    // Return a retryable status without exposing provider/database details or
    // allowing an unexpected webhook error to terminate the app worker.
    return new Response("webhook processing failed", { status: 500 });
  }

  return new Response(null, { status: 200 });
}
