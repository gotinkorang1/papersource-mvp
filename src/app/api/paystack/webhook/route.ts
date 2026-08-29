import { processPaystackWebhook, WebhookSignatureError } from "@/features/payments/webhook";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  try {
    await processPaystackWebhook(rawBody, signature);
  } catch (error) {
    if (error instanceof WebhookSignatureError) {
      return new Response("invalid signature", { status: 401 });
    }
    throw error;
  }

  return new Response(null, { status: 200 });
}
