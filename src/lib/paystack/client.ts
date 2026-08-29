import { pesewasToPaystackAmount } from "@/lib/paystack/amount";
import { isLivePaystack, paystackSecret } from "@/lib/paystack/signature";
import { publicEnv } from "@/lib/env";

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

function siteUrl() {
  return publicEnv.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function initializePaystackTransaction(input: {
  email: string;
  amountPesewas: number;
  reference: string;
  callbackUrl: string;
}): Promise<PaystackInitResult> {
  const amount = pesewasToPaystackAmount(input.amountPesewas);

  if (!isLivePaystack()) {
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
  });

  const payload = (await response.json()) as {
    status: boolean;
    message?: string;
    data?: { authorization_url: string; reference: string };
  };

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
): Promise<PaystackVerifyResult> {
  if (!isLivePaystack()) {
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
    },
  );
  const payload = (await response.json()) as {
    status: boolean;
    data?: { status: string; amount: number; reference: string; currency: string };
  };

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
