import { pesewasToPaystackAmount } from "@/lib/paystack/amount";
import { isLivePaystack, paystackSecret } from "@/lib/paystack/signature";

export type PaystackInitResult = {
  authorizationUrl: string;
  reference: string;
  raw: unknown;
};

export type PaystackVerifyResult = {
  status: "success" | "pending" | "failed";
  amount: number;
  reference: string;
  currency: string;
};

export type PaystackMode = "test" | "live";

export async function initializePaystackTransaction(input: {
  email: string;
  amountPesewas: number;
  reference: string;
  callbackUrl: string;
  mode?: PaystackMode;
}): Promise<PaystackInitResult> {
  const amount = pesewasToPaystackAmount(input.amountPesewas);

  if ((input.mode ?? (isLivePaystack() ? "live" : "test")) !== "live") {
    return {
      authorizationUrl: `/pay/mock/${input.reference}`,
      reference: input.reference,
      raw: { mock: true, amount },
    };
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecret()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount,
      currency: "GHS",
      reference: input.reference,
      callback_url: input.callbackUrl,
      channels: ["card", "mobile_money"],
    }),
    signal: AbortSignal.timeout(15_000),
  });

  let payload: {
    status: boolean;
    message?: string;
    data?: { authorization_url: string; reference: string };
  };
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    throw new Error("Paystack returned an invalid response.");
  }

  if (!response.ok || !payload.status || !payload.data) {
    throw new Error(payload.message ?? "Paystack could not start this payment.");
  }

  return {
    authorizationUrl: payload.data.authorization_url,
    reference: payload.data.reference,
    raw: payload,
  };
}

export async function verifyPaystackTransaction(
  reference: string,
  mode?: PaystackMode,
): Promise<PaystackVerifyResult> {
  if ((mode ?? (isLivePaystack() ? "live" : "test")) !== "live") {
    return {
      status: "pending",
      amount: 0,
      reference,
      currency: "GHS",
    };
  }

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${paystackSecret()}` },
      signal: AbortSignal.timeout(15_000),
    },
  );
  let payload: {
    status: boolean;
    data?: { status: string; amount: number; reference: string; currency: string };
  };
  try {
    payload = (await response.json()) as typeof payload;
  } catch {
    return { status: "failed", amount: 0, reference, currency: "GHS" };
  }

  if (!response.ok || !payload.status || !payload.data) {
    return { status: "failed", amount: 0, reference, currency: "GHS" };
  }

  const status =
    payload.data.status === "success"
      ? "success"
      : payload.data.status === "failed"
        ? "failed"
        : "pending";

  return {
    status,
    amount: payload.data.amount,
    reference: payload.data.reference,
    currency: payload.data.currency,
  };
}
