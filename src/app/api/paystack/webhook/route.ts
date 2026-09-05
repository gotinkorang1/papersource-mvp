import { processPaystackWebhook, WebhookSignatureError } from "@/features/payments/webhook";
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
    captureServerException(error, {
      operation: "paystack_webhook",
      route: new URL(request.url).pathname,
      dependency: "paystack",
    });
    throw error;
  }

  return new Response(null, { status: 200 });
}
