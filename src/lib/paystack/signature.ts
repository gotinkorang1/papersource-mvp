import { createHmac, timingSafeEqual } from "node:crypto";

export const PAYSTACK_MOCK_SECRET = "sk_test_papersource_local";

export function paystackSecret() {
  const configured = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("PAYSTACK_SECRET_KEY is required in production");
  }

  return PAYSTACK_MOCK_SECRET;
}

export function isLivePaystack() {
  return process.env.PAYSTACK_MODE === "live";
}

export function signPaystackBody(rawBody: string, secret = paystackSecret()) {
  return createHmac("sha512", secret).update(rawBody).digest("hex");
}

export function paystackSignatureValid(
  rawBody: string,
  signature: string,
  secret = paystackSecret(),
) {
  if (!signature) {
    return false;
  }

  const expected = signPaystackBody(rawBody, secret);
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  return left.length === right.length && timingSafeEqual(left, right);
}
